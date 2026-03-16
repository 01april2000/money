import { Snap } from "midtrans-client"
import crypto from "crypto"

// Initialize Midtrans Snap client
export const midtransClient = new Snap({
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
})

// Get Midtrans API URL based on environment
export const getMidtransApiUrl = () => {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1"
}

// Create Snap transaction
export const createSnapTransaction = async (params: {
  orderId: string
  grossAmount: number
  customerDetails: {
    firstName: string
    lastName?: string
    email: string
    phone?: string
  }
  itemDetails?: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
  callbacks?: {
    finish?: string
    unfinish?: string
    error?: string
  }
}) => {
  try {
    const transaction: any = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: params.customerDetails,
      callbacks: params.callbacks,
    }

    if (params.itemDetails) {
      transaction.item_details = params.itemDetails
    }

    const response = await midtransClient.createTransaction(transaction)
    return response
  } catch (error) {
    console.error("Error creating Snap transaction:", error)
    throw error
  }
}

// Verify Midtrans notification signature
export const verifyNotificationSignature = (notification: {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
}): boolean => {
  const signatureKey = crypto
    .createHash("sha512")
    .update(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
    )
    .digest("hex")

  return signatureKey === notification.signature_key
}

// Check if transaction is successful
export const isTransactionSuccessful = (transactionStatus: string): boolean => {
  return transactionStatus === "settlement" || transactionStatus === "capture"
}

// Check if transaction is pending
export const isTransactionPending = (transactionStatus: string): boolean => {
  return transactionStatus === "pending"
}

// Check if transaction is failed
export const isTransactionFailed = (transactionStatus: string): boolean => {
  return transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire"
}

// Format amount for Midtrans (integer)
export const formatAmount = (amount: number): number => {
  return Math.round(amount)
}

// Get transaction status from Midtrans API
export const getTransactionStatus = async (orderId: string) => {
  try {
    const response = await (midtransClient as any).transaction.status(orderId)
    return response
  } catch (error) {
    console.error("Error fetching transaction status from Midtrans:", error)
    throw error
  }
}
