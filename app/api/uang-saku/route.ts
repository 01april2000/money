import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN"]

// GET all UANG_SAKU transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get("santriId")
    const statusUangSaku = searchParams.get("statusUangSaku")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      jenis: "UANG_SAKU",
    }

    if (santriId) {
      where.santriId = santriId
    }

    if (statusUangSaku) {
      where.statusUangSaku = statusUangSaku
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

    const uangSakuTransactions = await prisma.transaksi.findMany({
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

    return NextResponse.json(uangSakuTransactions)
  } catch (error) {
    console.error("Error fetching UANG_SAKU transactions:", error)
    return NextResponse.json({ error: "Failed to fetch UANG_SAKU transactions" }, { status: 500 })
  }
}

// POST create new UANG_SAKU transaction (add or deduct balance)
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
    const { santriId, jumlah, keterangan, statusUangSaku } = body

    // Validate required fields
    if (!santriId || !jumlah || !statusUangSaku) {
      return NextResponse.json(
        { error: "Missing required fields: santriId, jumlah, statusUangSaku" },
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
