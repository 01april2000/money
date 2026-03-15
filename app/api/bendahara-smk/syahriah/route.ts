import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for bendahara-smk access
const BENDAHARA_SMK_ROLES = ["ADMIN", "BENDAHARA_SMK"]

// GET all Syahriah transactions for SMK santri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get("santriId")
    const status = searchParams.get("status")
    const bulan = searchParams.get("bulan")
    const periodePembayaran = searchParams.get("periodePembayaran")
    const tahun = searchParams.get("tahun")

    const where: any = {
      jenis: "SYAHRIAH",
      managedBy: "BENDAHARA_SMK",
    }

    if (santriId) {
      where.santriId = santriId
    }

    if (status) {
      where.status = status
    }

    if (bulan) {
      where.bulan = bulan
    }

    if (periodePembayaran) {
      where.periodePembayaran = periodePembayaran
    }

    if (tahun) {
      where.tahun = parseInt(tahun)
    }

    const syahriahTransactions = await prisma.transaksi.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        santri: {
          select: {
            id: true,
            nama: true,
            nis: true,
            kelas: true,
            asrama: true,
            jenisSantri: true,
          },
        },
      },
    })

    return NextResponse.json(syahriahTransactions)
  } catch (error) {
    console.error("Error fetching Syahriah transactions:", error)
    return NextResponse.json({ error: "Failed to fetch Syahriah transactions" }, { status: 500 })
  }
}

// POST create new Syahriah transaction
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
    if (!BENDAHARA_SMK_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { santriId, bulan, jumlah, status, tanggalBayar, keterangan, periodePembayaran, tahun } = body

    // Validate required fields
    if (!santriId || !bulan || !jumlah) {
      return NextResponse.json(
        { error: "Missing required fields: santriId, bulan, jumlah" },
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

    // Check if santri exists and is SMK santri
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
    })

    if (!santri) {
      return NextResponse.json(
        { error: "Santri not found" },
        { status: 404 }
      )
    }

    if (santri.jenisSantri !== "SMK") {
      return NextResponse.json(
        { error: "Only SMK santri can be managed by Bendahara SMK" },
        { status: 400 }
      )
    }

    // Check if Syahriah transaction for this santri and month already exists
    const existingTransaction = await prisma.transaksi.findFirst({
      where: {
        santriId,
        jenis: "SYAHRIAH",
        bulan,
        managedBy: "BENDAHARA_SMK",
      },
    })

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Syahriah transaction for this month already exists" },
        { status: 400 }
      )
    }

    // Generate unique transaction code
    const tahunKode = tahun || new Date().getFullYear()
    const kode = `SYAH-SMK-${tahunKode}-${bulan}-${santri.nis}-${Date.now().toString().slice(-4)}`

    // Create Syahriah transaction
    const syahriahTransaction = await prisma.transaksi.create({
      data: {
        kode,
        santriId,
        jenis: "SYAHRIAH",
        bulan,
        periodePembayaran,
        tahun: tahun ? parseInt(tahun) : null,
        jumlah: parseInt(jumlah),
        status: status || "BELUM_BAYAR",
        tanggalBayar: tanggalBayar ? new Date(tanggalBayar) : null,
        keterangan,
        managedBy: "BENDAHARA_SMK",
      },
      include: {
        santri: {
          select: {
            id: true,
            nama: true,
            nis: true,
            kelas: true,
            asrama: true,
          },
        },
      },
    })

    return NextResponse.json(syahriahTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating Syahriah transaction:", error)
    return NextResponse.json({ error: "Failed to create Syahriah transaction" }, { status: 500 })
  }
}
