import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN"]

// GET all UANG_SAKU transactions for a specific santri with balance calculation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ santriId: string }> }
) {
  try {
    const { santriId } = await params
    const { searchParams } = new URL(request.url)
    const statusUangSaku = searchParams.get("statusUangSaku")

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
      jenis: "UANG_SAKU",
    }

    if (statusUangSaku) {
      where.statusUangSaku = statusUangSaku
    }

    // Get all UANG_SAKU transactions for this santri
    const uangSakuTransactions = await prisma.transaksi.findMany({
      where,
      include: {
        midtransTransactions: {
          where: {
            transactionStatus: {
              in: ["pending", "authorize", "settlement", "capture"],
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate balance
    const totalTambah = uangSakuTransactions
      .filter(t => t.statusUangSaku === "DITAMBAH")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalAmbil = uangSakuTransactions
      .filter(t => t.statusUangSaku === "DIAMBIL")
      .reduce((sum, t) => sum + Math.abs(t.jumlah), 0)

    const saldo = totalTambah - totalAmbil

    // Separate transactions by type
    const tambahTransactions = uangSakuTransactions.filter(t => t.statusUangSaku === "DITAMBAH")
    const ambilTransactions = uangSakuTransactions.filter(t => t.statusUangSaku === "DIAMBIL")

    return NextResponse.json({
      santri,
      transactions: uangSakuTransactions,
      statistics: {
        totalTambah,
        totalAmbil,
        saldo,
        transactionCount: uangSakuTransactions.length,
        tambahCount: tambahTransactions.length,
        ambilCount: ambilTransactions.length,
      },
    })
  } catch (error) {
    console.error("Error fetching santri UANG_SAKU history:", error)
    return NextResponse.json({ error: "Failed to fetch santri UANG_SAKU history" }, { status: 500 })
  }
}

// POST create new UANG_SAKU transaction for a specific santri
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
    const { jumlah, keterangan, statusUangSaku } = body

    // Validate required fields
    if (!jumlah || !statusUangSaku) {
      return NextResponse.json(
        { error: "Missing required fields: jumlah, statusUangSaku" },
        { status: 400 }
      )
    }

    // Validate statusUangSaku
    if (statusUangSaku !== "DITAMBAH" && statusUangSaku !== "DIAMBIL") {
      return NextResponse.json(
        { error: "statusUangSaku must be either 'DITAMBAH' or 'DIAMBIL'" },
        { status: 400 }
      )
    }

    // Validate jumlah is a positive number
    if (typeof jumlah !== "number" || jumlah <= 0) {
      return NextResponse.json(
        { error: "Jumlah must be a positive number" },
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

    // Determine if this is a credit (add) or debit (deduct) transaction
    const isCredit = statusUangSaku === "DITAMBAH"
    const finalJumlah = isCredit ? jumlah : -jumlah

    // Check if there's enough balance for withdrawal
    if (!isCredit) {
      const allTransactions = await prisma.transaksi.findMany({
        where: {
          santriId,
          jenis: "UANG_SAKU",
        },
      })

      const currentBalance = allTransactions.reduce((sum, t) => sum + t.jumlah, 0)

      if (currentBalance < jumlah) {
        return NextResponse.json(
          { error: "Saldo tidak mencukupi untuk penarikan", currentBalance },
          { status: 400 }
        )
      }
    }

    // Generate transaction code
    const prefix = isCredit ? "US-TAMBAH" : "US-AMBIL"
    const timestamp = Date.now().toString().slice(-6)
    const kode = `${prefix}-${santri.nis}-${timestamp}`

    // Create transaction
    const transaction = await prisma.transaksi.create({
      data: {
        kode,
        santriId,
        jenis: "UANG_SAKU",
        jumlah: finalJumlah,
        statusUangSaku,
        tanggalBayar: new Date(),
        keterangan: keterangan || (isCredit ? "Penambahan uang saku" : "Pengambilan uang saku"),
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
    console.error("Error creating UANG_SAKU transaction:", error)
    return NextResponse.json({ error: "Failed to create UANG_SAKU transaction" }, { status: 500 })
  }
}
