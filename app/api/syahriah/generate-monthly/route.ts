import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK", "BENDAHARA_SMP", "BENDAHARA_PONDOK"]

// POST auto-generate Syahriah transactions for all active santri
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
    const {
      bulan,
      jumlah,
      status = "BELUM_BAYAR",
      kelas,
      asrama,
      skipExisting = true,
      includeBeasiswa = false,
      keterangan,
    } = body

    // Validate required fields
    if (!bulan || !jumlah) {
      return NextResponse.json(
        { error: "Missing required fields: bulan, jumlah" },
        { status: 400 }
      )
    }

    // Build where clause for santri
    const santriWhere: any = {
      status: "AKTIF",
    }

    if (kelas) {
      santriWhere.kelas = kelas
    }

    if (asrama) {
      santriWhere.asrama = asrama
    }

    // Exclude beasiswa santri if includeBeasiswa is false
    if (!includeBeasiswa) {
      santriWhere.OR = [
        { beasiswa: false },
        { beasiswa: true, jenisBeasiswa: { notIn: ["SYAHRIAH", "FULL"] } },
      ]
    }

    // Get all active santri matching criteria
    const santriList = await prisma.santri.findMany({
      where: santriWhere,
      select: {
        id: true,
        nama: true,
        nis: true,
        kelas: true,
        asrama: true,
        status: true,
        beasiswa: true,
        jenisBeasiswa: true,
      },
    })

    let created = 0
    let skippedBeasiswa = 0
    let skippedExisting = 0
    const results: Array<{
      santriId: string
      nama: string
      nis: string
      status: string
      reason?: string
      transactionId?: string
    }> = []

    // Check for existing transactions if skipExisting is true
    let existingSantriIds = new Set<string>()
    if (skipExisting) {
      const existingTransactions = await prisma.transaksi.findMany({
        where: {
          jenis: "SYAHRIAH",
          bulan: bulan,
          santriId: { in: santriList.map(s => s.id) },
        },
        select: {
          santriId: true,
        },
      })
      existingSantriIds = new Set(existingTransactions.map(t => t.santriId))
    }

    // Process each santri
    for (const santri of santriList) {
      // Skip if santri has beasiswa (SYAHRIAH or FULL) and includeBeasiswa is false
      if (!includeBeasiswa && santri.beasiswa && (santri.jenisBeasiswa === "SYAHRIAH" || santri.jenisBeasiswa === "FULL")) {
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

      // Skip if transaction already exists for this month and skipExisting is true
      if (skipExisting && existingSantriIds.has(santri.id)) {
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
        const transaction = await prisma.transaksi.create({
          data: {
            kode: `SYH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            santriId: santri.id,
            jenis: "SYAHRIAH",
            bulan: bulan,
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
        totalActiveSantri: santriList.length,
        created,
        skipped: {
          beasiswa: skippedBeasiswa,
          existing: skippedExisting,
          total: skippedBeasiswa + skippedExisting,
        },
      },
      results,
    })
  } catch (error) {
    console.error("Error in auto-generate Syahriah:", error)
    return NextResponse.json(
      { error: "Failed to auto-generate Syahriah transactions" },
      { status: 500 }
    )
  }
}
