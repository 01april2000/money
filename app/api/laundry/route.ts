import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK", "BENDAHARA_SMP", "BENDAHARA_PONDOK"]

// GET all LAUNDRY transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get("santriId")
    const status = searchParams.get("status")
    const bulan = searchParams.get("bulan")
    const tahun = searchParams.get("tahun")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      jenis: "LAUNDRY",
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

    if (tahun) {
      where.tahun = parseInt(tahun)
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const laundryTransactions = await prisma.transaksi.findMany({
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
          },
        },
      },
    })

    return NextResponse.json(laundryTransactions)
  } catch (error) {
    console.error("Error fetching LAUNDRY transactions:", error)
    return NextResponse.json({ error: "Failed to fetch LAUNDRY transactions" }, { status: 500 })
  }
}

// POST create new LAUNDRY transaction
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
    const { santriId, bulan, tahun, jenisLaundry, keterangan } = body

    // Validate required fields
    if (!santriId || !bulan || !tahun) {
      return NextResponse.json(
        { error: "Missing required fields: santriId, bulan, tahun" },
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
    console.error("Error creating LAUNDRY transaction:", error)
    return NextResponse.json({ error: "Failed to create LAUNDRY transaction" }, { status: 500 })
  }
}
