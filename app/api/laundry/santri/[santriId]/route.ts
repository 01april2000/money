import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN"]

// GET all LAUNDRY transactions for a specific santri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ santriId: string }> }
) {
  try {
    const { santriId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const bulan = searchParams.get("bulan")
    const tahun = searchParams.get("tahun")

    // Check if santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
      select: {
        id: true,
        nama: true,
        nis: true,
        kelas: true,
        asrama: true,
        wali: true,
      },
    })

    if (!santri) {
      return NextResponse.json({ error: "Santri not found" }, { status: 404 })
    }

    // Build where clause
    const where: any = {
      santriId,
      jenis: "LAUNDRY",
    }

    if (status) {
      where.status = status
    }

    if (bulan) {
      where.bulan = bulan
    }

    if (tahun) {
      where.tahun = parseInt(tahun)
    }

    // Get all LAUNDRY transactions for this santri
    const laundryTransactions = await prisma.transaksi.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    // Calculate statistics
    const totalTransactions = laundryTransactions.length
    const totalPaid = laundryTransactions
      .filter(t => t.status === "LUNAS")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalUnpaid = laundryTransactions
      .filter(t => t.status === "BELUM_BAYAR")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const paidCount = laundryTransactions.filter(t => t.status === "LUNAS").length
    const unpaidCount = laundryTransactions.filter(t => t.status === "BELUM_BAYAR").length

    return NextResponse.json({
      santri,
      transactions: laundryTransactions,
      statistics: {
        totalTransactions,
        totalPaid,
        totalUnpaid,
        paidCount,
        unpaidCount,
      },
    })
  } catch (error) {
    console.error("Error fetching santri LAUNDRY history:", error)
    return NextResponse.json({ error: "Failed to fetch santri LAUNDRY history" }, { status: 500 })
  }
}

// POST create new LAUNDRY transaction for a specific santri
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ santriId: string }> }
) {
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

    const { santriId } = await params
    const body = await request.json()
    const { bulan, tahun, jenisLaundry, keterangan } = body

    // Validate required fields
    if (!bulan || !tahun) {
      return NextResponse.json(
        { error: "Missing required fields: bulan, tahun" },
        { status: 400 }
      )
    }

    // Validate bulan
    const validBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    if (!validBulan.includes(bulan)) {
      return NextResponse.json(
        { error: "Bulan tidak valid. Gunakan nama bulan dalam bahasa Indonesia." },
        { status: 400 }
      )
    }

    // Validate tahun
    if (typeof tahun !== "number" || tahun < 2000 || tahun > 2100) {
      return NextResponse.json(
        { error: "Tahun tidak valid" },
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

    // Check if laundry transaction already exists for this month and year
    const existingTransaction = await prisma.transaksi.findFirst({
      where: {
        santriId,
        jenis: "LAUNDRY",
        bulan,
        tahun,
      },
    })

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Santri sudah memiliki transaksi laundry untuk bulan ini", existingTransaction },
        { status: 400 }
      )
    }

    // Generate transaction code
    const timestamp = Date.now().toString().slice(-6)
    const kode = `LD-${santri.nis}-${bulan.substring(0, 3).toUpperCase()}-${timestamp}`

    // Create transaction
    const transaction = await prisma.transaksi.create({
      data: {
        kode,
        santriId,
        jenis: "LAUNDRY",
        jumlah: 100000,
        bulan,
        tahun,
        status: "BELUM_BAYAR",
        jenisLaundry: jenisLaundry || "Cuci Setrika",
        keterangan: keterangan || `Laundry bulan ${bulan} ${tahun}`,
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

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating LAUNDRY transaction for santri:", error)
    return NextResponse.json({ error: "Failed to create LAUNDRY transaction for santri" }, { status: 500 })
  }
}
