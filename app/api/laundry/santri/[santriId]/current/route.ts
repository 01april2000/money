import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN"]

// Helper function to get current month and year in Indonesian
function getCurrentMonthYear() {
  const now = new Date()
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]
  return {
    bulan: months[now.getMonth()],
    tahun: now.getFullYear()
  }
}

// GET current month LAUNDRY status for a specific santri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ santriId: string }> }
) {
  try {
    const { santriId } = await params
    const { searchParams } = new URL(request.url)
    const customBulan = searchParams.get("bulan")
    const customTahun = searchParams.get("tahun")

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    // Use custom month/year if provided, otherwise use current month/year
    const { bulan, tahun } = customBulan && customTahun
      ? { bulan: customBulan, tahun: parseInt(customTahun) }
      : getCurrentMonthYear()

    // Check if santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
      select: {
        id: true,
        nama: true,
        nis: true,
        kelas: true,
        asrama: true,
      },
    })

    if (!santri) {
      return NextResponse.json({ error: "Santri not found" }, { status: 404 })
    }

    // Find current month laundry transaction
    const laundryTransaction = await prisma.transaksi.findFirst({
      where: {
        santriId,
        jenis: "LAUNDRY",
        bulan,
        tahun,
      },
    })

    if (!laundryTransaction) {
      return NextResponse.json({
        santri,
        bulan,
        tahun,
        status: "NOT_REGISTERED",
        message: `Santri belum terdaftar untuk laundry bulan ${bulan} ${tahun}`,
        transaction: null,
      })
    }

    return NextResponse.json({
      santri,
      bulan,
      tahun,
      status: "REGISTERED",
      transaction: laundryTransaction,
      isPaid: laundryTransaction.status === "LUNAS",
    })
  } catch (error) {
    console.error("Error fetching current month LAUNDRY status:", error)
    return NextResponse.json({ error: "Failed to fetch current month LAUNDRY status" }, { status: 500 })
  }
}

// POST register current month LAUNDRY for a specific santri
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
    const { jenisLaundry, keterangan } = body

    // Get current month and year
    const { bulan, tahun } = getCurrentMonthYear()

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
    console.error("Error registering current month LAUNDRY:", error)
    return NextResponse.json({ error: "Failed to register current month LAUNDRY" }, { status: 500 })
  }
}
