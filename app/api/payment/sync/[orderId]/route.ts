import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getTransactionStatus, isTransactionSuccessful, isTransactionFailed } from "@/lib/midtrans"

export async function POST(
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
      include: { transaksi: true },
    })

    if (!midtransTx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Check if user has permission to sync this transaction
    const userRole = (session.user as any)?.role
    const santriId = (session.user as any)?.santriId

    if (userRole === "SANTRI" && midtransTx.transaksi.santriId !== santriId) {
      return NextResponse.json(
        { error: "Forbidden - You can only sync your own transactions" },
        { status: 403 }
      )
    }

    // Get transaction status from Midtrans API
    const midtransStatus = await getTransactionStatus(orderId)

    console.log("Fetched Midtrans status:", midtransStatus)

    // Update Midtrans transaction
    const updatedMidtransTx = await prisma.midtransTransaction.update({
      where: { id: midtransTx.id },
      data: {
        transactionId: midtransStatus.transaction_id || null,
        paymentType: midtransStatus.payment_type || null,
        transactionStatus: midtransStatus.transaction_status,
        fraudStatus: midtransStatus.fraud_status || null,
        transactionTime: midtransStatus.transaction_time ? new Date(midtransStatus.transaction_time) : null,
        settlementTime: midtransStatus.settlement_time ? new Date(midtransStatus.settlement_time) : null,
      },
    })

    console.log("Updated Midtrans transaction:", updatedMidtransTx)

    // Update main transaction status based on payment status
    if (isTransactionSuccessful(midtransStatus.transaction_status)) {
      // Payment successful - mark as LUNAS
      const updatedTransaksi = await prisma.transaksi.update({
        where: { id: midtransTx.transaksiId },
        data: {
          status: "LUNAS",
          tanggalBayar: midtransStatus.settlement_time
            ? new Date(midtransStatus.settlement_time)
            : new Date(),
        },
      })

      console.log("Updated transaction to LUNAS:", updatedTransaksi)
    } else if (isTransactionFailed(midtransStatus.transaction_status)) {
      // Payment failed - mark as DITOLAK
      const updatedTransaksi = await prisma.transaksi.update({
        where: { id: midtransTx.transaksiId },
        data: {
          status: "DITOLAK",
        },
      })

      console.log("Updated transaction to DITOLAK:", updatedTransaksi)
    } else if (midtransStatus.transaction_status === "pending") {
      // Payment pending - mark as PENDING
      const updatedTransaksi = await prisma.transaksi.update({
        where: { id: midtransTx.transaksiId },
        data: {
          status: "PENDING",
        },
      })

      console.log("Updated transaction to PENDING:", updatedTransaksi)
    }

    return NextResponse.json({
      orderId: updatedMidtransTx.orderId,
      transactionStatus: updatedMidtransTx.transactionStatus,
      transaksiStatus: midtransTx.transaksi.status,
    })
  } catch (error) {
    console.error("Error syncing payment status:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
