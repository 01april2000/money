import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin and bendahara SMK access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK"]

// GET all UJIAN transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get("santriId")
    const status = searchParams.get("status")
    const tahun = searchParams.get("tahun")

    const where: any = {
      jenis: "UJIAN",
    }

    if (santriId) {
      where.santriId = santriId
    }

    if (status) {
      where.status = status
    }

    if (tahun) {
      where.tahun = parseInt(tahun)
    }

    const ujianTransactions = await prisma.transaksi.findMany({
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

    return NextResponse.json(ujianTransactions)
  } catch (error) {
    console.error("Error fetching UJIAN transactions:", error)
    return NextResponse.json({ error: "Failed to fetch UJIAN transactions" }, { status: 500 })
  }
}

// POST create new UJIAN transaction
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
    const { santriId, tahun, jumlah, status, tanggalBayar, keterangan } = body

    // Validate required fields
    if (!santriId || !tahun || !jumlah) {
      return NextResponse.json(
        { error: "Missing required fields: santriId, tahun, jumlah" },
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

    // Check if UJIAN transaction for this santri and year already exists
    const existingTransaction = await prisma.transaksi.findFirst({
      where: {
        santriId,
        jenis: "UJIAN",
        tahun: parseInt(tahun),
      },
    })

    if (existingTransaction) {
      return NextResponse.json(
        { error: "UJIAN transaction for this year already exists" },
        { status: 400 }
      )
    }

    // Generate unique transaction code
    const kode = `UJIAN-${tahun}-${santri.nis}-${Date.now().toString().slice(-4)}`

    // Create UJIAN transaction
    const ujianTransaction = await prisma.transaksi.create({
      data: {
        kode,
        santriId,
        jenis: "UJIAN",
        tahun: parseInt(tahun),
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

    return NextResponse.json(ujianTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating UJIAN transaction:", error)
    return NextResponse.json({ error: "Failed to create UJIAN transaction" }, { status: 500 })
  }
}
