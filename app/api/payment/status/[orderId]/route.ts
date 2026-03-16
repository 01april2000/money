import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

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

    // Find the Midtrans transaction
    const midtransTx = await prisma.midtransTransaction.findUnique({
      where: { orderId },
      include: {
        transaksi: {
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
        },
      },
    })

    if (!midtransTx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Check if user has permission to view this transaction
    const userRole = (session.user as any)?.role
    const santriId = (session.user as any)?.santriId

    if (userRole === "SANTRI" && midtransTx.transaksi.santriId !== santriId) {
      return NextResponse.json(
        { error: "Forbidden - You can only view your own transactions" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      orderId: midtransTx.orderId,
      transactionId: midtransTx.transactionId,
      transactionStatus: midtransTx.transactionStatus,
      paymentType: midtransTx.paymentType,
      fraudStatus: midtransTx.fraudStatus,
      grossAmount: midtransTx.grossAmount,
      transactionTime: midtransTx.transactionTime,
      settlementTime: midtransTx.settlementTime,
      transaksi: {
        id: midtransTx.transaksi.id,
        kode: midtransTx.transaksi.kode,
        jenis: midtransTx.transaksi.jenis,
        status: midtransTx.transaksi.status,
        tanggalBayar: midtransTx.transaksi.tanggalBayar,
      },
    })
  } catch (error) {
    console.error("Error fetching payment status:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
