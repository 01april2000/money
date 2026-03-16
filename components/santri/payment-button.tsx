"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface PaymentButtonProps {
  transaksiId: string
  amount: number
  disabled?: boolean
  onPaymentComplete?: () => void
  orderId?: string
}

export function PaymentButton({
  transaksiId,
  amount,
  disabled = false,
  onPaymentComplete,
  orderId,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaksiId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      // Load Midtrans Snap script dynamically
      if (!(window as any).snap) {
        const script = document.createElement("script")
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js"
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "")
        script.async = true

        script.onload = () => {
          openMidtransPopup(data.snapToken, data.orderId)
        }

        document.body.appendChild(script)
      } else {
        openMidtransPopup(data.snapToken, data.orderId)
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat memproses pembayaran")
      setLoading(false)
    }
  }

  const openMidtransPopup = (snapToken: string, orderId: string) => {
    setCurrentOrderId(orderId)
    ;(window as any).snap.pay(snapToken, {
      onSuccess: async (result: any) => {
        console.log("Payment successful:", result)
        toast.success("Pembayaran berhasil!")
        setLoading(false)
        
        // Sync payment status from Midtrans
        if (orderId) {
          await syncPaymentStatus(orderId)
        }
        
        onPaymentComplete?.()
      },
      onPending: async (result: any) => {
        console.log("Payment pending:", result)
        toast.info("Pembayaran sedang diproses")
        setLoading(false)
        
        // Sync payment status from Midtrans
        if (orderId) {
          await syncPaymentStatus(orderId)
        }
        
        onPaymentComplete?.()
      },
      onError: (result: any) => {
        console.log("Payment failed:", result)
        toast.error("Pembayaran gagal. Silakan coba lagi.")
        setLoading(false)
        
        // Sync payment status from Midtrans
        if (orderId) {
          syncPaymentStatus(orderId)
        }
      },
      onClose: () => {
        console.log("Payment popup closed")
        setLoading(false)
      },
    })
  }

  const syncPaymentStatus = async (orderId: string) => {
    try {
      // Poll the payment status until it's no longer pending
      let attempts = 0
      const maxAttempts = 10
      const pollInterval = 2000 // 2 seconds

      while (attempts < maxAttempts) {
        const response = await fetch(`/api/payment/sync/${orderId}`, {
          method: "POST",
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Synced payment status:", data)
          
          // If the transaction is no longer pending, stop polling
          if (data.transactionStatus !== "pending") {
            break
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      }
    } catch (error) {
      console.error("Error syncing payment status:", error)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Bayar {formatCurrency(amount)}
        </>
      )}
    </Button>
  )
}
