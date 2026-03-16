"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/santri/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { PaymentButton } from "@/components/santri/payment-button"

interface Transaksi {
  id: string
  kode: string
  jumlah: number
  statusUangSaku: string
  keterangan: string | null
  createdAt: string
  midtransTransactions?: Array<{
    id: string
    orderId: string
    transactionStatus: string
  }>
}

export default function UangSakuPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [uangSakuData, setUangSakuData] = useState<Transaksi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth")
    }
  }, [session, isPending, router])

  useEffect(() => {
    const fetchUangSaku = async () => {
      try {
        const santriId = (session?.user as any)?.santriId
        if (santriId) {
          const res = await fetch(`/api/uang-saku/santri/${santriId}`)
          const data = await res.json()
          setUangSakuData(data.transactions || [])
        }
      } catch (error) {
        console.error("Error fetching uang saku data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchUangSaku()
    }
  }, [session])

  const handlePaymentComplete = () => {
    // Refresh Uang Saku data after payment
    const fetchUangSaku = async () => {
      try {
        const santriId = (session?.user as any)?.santriId
        if (santriId) {
          const res = await fetch(`/api/uang-saku/santri/${santriId}`)
          const data = await res.json()
          setUangSakuData(data.transactions || [])
        }
      } catch (error) {
        console.error("Error fetching uang saku data:", error)
      }
    }
    fetchUangSaku()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateBalance = () => {
    return uangSakuData.reduce((total, t) => {
      if (t.statusUangSaku === "DITAMBAH") {
        return total + t.jumlah
      } else if (t.statusUangSaku === "DIAMBIL") {
        return total - t.jumlah
      }
      return total
    }, 0)
  }

  const calculateTotalMasuk = () => {
    return uangSakuData
      .filter((t) => t.statusUangSaku === "DITAMBAH")
      .reduce((total, t) => total + t.jumlah, 0)
  }

  const calculateTotalKeluar = () => {
    return uangSakuData
      .filter((t) => t.statusUangSaku === "DIAMBIL")
      .reduce((total, t) => total + t.jumlah, 0)
  }

  if (isPending || loading) {
    return (
      <DashboardLayout activeItem="uang-saku">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  const balance = calculateBalance()
  const totalMasuk = calculateTotalMasuk()
  const totalKeluar = calculateTotalKeluar()

  return (
    <DashboardLayout activeItem="uang-saku">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Uang Saku</h1>
          <p className="text-muted-foreground">
            Riwayat uang saku santri
          </p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-white/90 text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Saldo Uang Saku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl lg:text-4xl font-bold">
              {formatCurrency(balance)}
            </div>
            <p className="text-white/80 text-sm mt-1">
              Per {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Masuk</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalMasuk)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {uangSakuData.filter((t) => t.statusUangSaku === "DITAMBAH").length} transaksi
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keluar</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalKeluar)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {uangSakuData.filter((t) => t.statusUangSaku === "DIAMBIL").length} transaksi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {uangSakuData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada riwayat uang saku</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uangSakuData
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((transaksi) => (
                    <div
                      key={transaksi.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaksi.statusUangSaku === "DITAMBAH"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}>
                          {transaksi.statusUangSaku === "DITAMBAH" ? (
                            <ArrowDownCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {transaksi.statusUangSaku === "DITAMBAH" ? "Uang Masuk" : "Uang Keluar"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {transaksi.keterangan || "Tidak ada keterangan"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaksi.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className={`text-right font-semibold ${
                          transaksi.statusUangSaku === "DITAMBAH"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {transaksi.statusUangSaku === "DITAMBAH" ? "+" : "-"}
                          {formatCurrency(transaksi.jumlah)}
                        </div>
                        {transaksi.statusUangSaku === "DITAMBAH" && (
                          <PaymentButton
                            transaksiId={transaksi.id}
                            amount={transaksi.jumlah}
                            onPaymentComplete={handlePaymentComplete}
                            orderId={transaksi.midtransTransactions?.[0]?.orderId}
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
