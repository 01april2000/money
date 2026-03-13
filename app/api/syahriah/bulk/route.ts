import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK", "BENDAHARA_SMP", "BENDAHARA_PONDOK"]

// POST create multiple Syahriah transactions (Bulk Billing)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { santriIds, bulan, jumlah, status = "BELUM_BAYAR", keterangan, periodePembayaran, tahun } = body

    // Validate required fields
    if (!santriIds || !Array.isArray(santriIds) || santriIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: santriIds (must be non-empty array)" },
        { status: 400 }
      )
    }

    if (!bulan || !jumlah) {
      return NextResponse.json(
        { error: "Missing required fields: bulan, jumlah" },
        { status: 400 }
      )
    }

    // Validate periodePembayaran if provided
    if (periodePembayaran && !["BULANAN", "TAHUNAN"].includes(periodePembayaran)) {
      return NextResponse.json(
        { error: "Invalid periodePembayaran. Must be 'BULANAN' or 'TAHUNAN'" },
        { status: 400 }
      )
    }

    // Get all santri with their beasiswa status
    const santriList = await prisma.santri.findMany({
      where: {
        id: { in: santriIds },
      },
      select: {
        id: true,
        nama: true,
        nis: true,
        status: true,
        beasiswa: true,
        jenisBeasiswa: true,
      },
    })

    const results: Array<{
      santriId: string
      nama: string
      nis: string
      status: string
      reason?: string
      transactionId?: string
    }> = []

    let created = 0
    let skippedBeasiswa = 0
    let skippedNonAktif = 0
    let skippedExisting = 0

    // Check for existing transactions for this month
    const existingTransactions = await prisma.transaksi.findMany({
      where: {
        jenis: "SYAHRIAH",
        bulan: bulan,
        santriId: { in: santriIds },
      },
      select: {
        santriId: true,
      },
    })

    const existingSantriIds = new Set(existingTransactions.map(t => t.santriId))

    // Process each santri
    for (const santri of santriList) {
      // Skip if santri is non-aktif
      if (santri.status !== "AKTIF") {
        results.push({
          santriId: santri.id,
          nama: santri.nama,
          nis: santri.nis,
          status: "skipped",
          reason: "Santri tidak aktif",
        })
        skippedNonAktif++
        continue
      }

      // Skip if santri has beasiswa (SYAHRIAH or FULL)
      if (santri.beasiswa && (santri.jenisBeasiswa === "SYAHRIAH" || santri.jenisBeasiswa === "FULL")) {
        results.push({
          santriId: santri.id,
          nama: santri.nama,
          nis: santri.nis,
          status: "skipped",
          reason: "Santri mendapatkan beasiswa",
        })
        skippedBeasiswa++
        continue
      }

      // Skip if transaction already exists for this month
      if (existingSantriIds.has(santri.id)) {
        results.push({
          santriId: santri.id,
          nama: santri.nama,
          nis: santri.nis,
          status: "skipped",
          reason: "Tagihan sudah ada untuk bulan ini",
        })
        skippedExisting++
        continue
      }

      // Create transaction
      try {
        const tahunKode = tahun || new Date().getFullYear()
        const transaction = await prisma.transaksi.create({
          data: {
            kode: `SYH-${tahunKode}-${bulan}-${santri.nis}-${Date.now().toString().slice(-4)}`,
            santriId: santri.id,
            jenis: "SYAHRIAH",
            bulan: bulan,
            periodePembayaran: periodePembayaran,
            tahun: tahun ? parseInt(tahun) : null,
            jumlah: parseInt(jumlah.toString()),
            status: status,
            keterangan: keterangan,
          },
        })

        results.push({
          santriId: santri.id,
          nama: santri.nama,
          nis: santri.nis,
          status: "created",
          transactionId: transaction.id,
        })
        created++
      } catch (error) {
        console.error(`Error creating transaction for santri ${santri.id}:`, error)
        results.push({
          santriId: santri.id,
          nama: santri.nama,
          nis: santri.nis,
          status: "error",
          reason: "Gagal membuat transaksi",
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRequested: santriIds.length,
        created,
        skipped: {
          beasiswa: skippedBeasiswa,
          nonAktif: skippedNonAktif,
          existing: skippedExisting,
          total: skippedBeasiswa + skippedNonAktif + skippedExisting,
        },
      },
      results,
    })
  } catch (error) {
    console.error("Error in bulk Syahriah creation:", error)
    return NextResponse.json(
      { error: "Failed to create bulk Syahriah transactions" },
      { status: 500 }
    )
  }
}
