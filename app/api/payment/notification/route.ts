import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyNotificationSignature, isTransactionSuccessful, isTransactionFailed } from "@/lib/midtrans"

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    console.log("Received Midtrans notification:", notification)

    // Verify signature for security
    const isValid = verifyNotificationSignature(notification)
    if (!isValid) {
      console.error("Invalid signature for notification:", notification)
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Find the Midtrans transaction
    const midtransTx = await prisma.midtransTransaction.findUnique({
      where: { orderId: notification.order_id },
      include: { transaksi: true },
    })

    if (!midtransTx) {
      console.error("Midtrans transaction not found:", notification.order_id)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update Midtrans transaction
    const updatedMidtransTx = await prisma.midtransTransaction.update({
      where: { id: midtransTx.id },
      data: {
        transactionId: notification.transaction_id || null,
        paymentType: notification.payment_type || null,
        transactionStatus: notification.transaction_status,
        fraudStatus: notification.fraud_status || null,
        transactionTime: notification.transaction_time ? new Date(notification.transaction_time) : null,
        settlementTime: notification.settlement_time ? new Date(notification.settlement_time) : null,
      },
    })

    console.log("Updated Midtrans transaction:", updatedMidtransTx)

    // Update main transaction status based on payment status
    if (isTransactionSuccessful(notification.transaction_status)) {
      // Payment successful - mark as LUNAS
      const updatedTransaksi = await prisma.transaksi.update({
        where: { id: midtransTx.transaksiId },
        data: {
          status: "LUNAS",
          tanggalBayar: notification.settlement_time
            ? new Date(notification.settlement_time)
            : new Date(),
        },
      })

      console.log("Updated transaction to LUNAS:", updatedTransaksi)
    } else if (isTransactionFailed(notification.transaction_status)) {
      // Payment failed - mark as DITOLAK
      const updatedTransaksi = await prisma.transaksi.update({
        where: { id: midtransTx.transaksiId },
        data: {
          status: "DITOLAK",
        },
      })

      console.log("Updated transaction to DITOLAK:", updatedTransaksi)
    } else if (notification.transaction_status === "pending") {
      // Payment pending - mark as PENDING
      const updatedTransaksi = await prisma.transaksi.update({
        where: { id: midtransTx.transaksiId },
        data: {
          status: "PENDING",
        },
      })

      console.log("Updated transaction to PENDING:", updatedTransaksi)
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error processing notification:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
