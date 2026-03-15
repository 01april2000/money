import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin and bendahara SMK access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK"]

// GET all SPP transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get("santriId")
    const status = searchParams.get("status")
    const bulan = searchParams.get("bulan")

    const where: any = {
      jenis: "SPP",
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

    const sppTransactions = await prisma.transaksi.findMany({
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

    return NextResponse.json(sppTransactions)
  } catch (error) {
    console.error("Error fetching SPP transactions:", error)
    return NextResponse.json({ error: "Failed to fetch SPP transactions" }, { status: 500 })
  }
}

// POST create new SPP transaction
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
    const { santriId, bulan, jumlah, status, tanggalBayar, keterangan } = body

    // Validate required fields
    if (!santriId || !bulan || !jumlah) {
      return NextResponse.json(
        { error: "Missing required fields: santriId, bulan, jumlah" },
        { status: 400 }
      )
    }

    // Check if santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
    })

    if (!santri) {
      return NextResponse.json(
        { error: "Santri not found" },
        { status: 404 }
      )
    }

    // Check if SPP transaction for this santri and month already exists
    const existingTransaction = await prisma.transaksi.findFirst({
      where: {
        santriId,
        jenis: "SPP",
        bulan,
      },
    })

    if (existingTransaction) {
      return NextResponse.json(
        { error: "SPP transaction for this month already exists" },
        { status: 400 }
      )
    }

    // Generate unique transaction code
    const kode = `SPP-${new Date().getFullYear()}-${bulan}-${santri.nis}-${Date.now().toString().slice(-4)}`

    // Create SPP transaction
    const sppTransaction = await prisma.transaksi.create({
      data: {
        kode,
        santriId,
        jenis: "SPP",
        bulan,
        jumlah: parseInt(jumlah),
        status: status || "BELUM_BAYAR",
        tanggalBayar: tanggalBayar ? new Date(tanggalBayar) : null,
        keterangan,
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

    return NextResponse.json(sppTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating SPP transaction:", error)
    return NextResponse.json({ error: "Failed to create SPP transaction" }, { status: 500 })
  }
}
