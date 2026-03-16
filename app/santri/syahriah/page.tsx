"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/santri/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { PaymentButton } from "@/components/santri/payment-button"

interface Transaksi {
  id: string
  kode: string
  bulan: string
  tahun: number
  jumlah: number
  status: string
  tanggalBayar: string | null
  periodePembayaran: string | null
  createdAt: string
  midtransTransactions?: Array<{
    id: string
    orderId: string
    transactionStatus: string
  }>
}

export default function SyahriahPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [syahriahData, setSyahriahData] = useState<Transaksi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth")
    }
  }, [session, isPending, router])

  useEffect(() => {
    const fetchSyahriah = async () => {
      try {
        const santriId = (session?.user as any)?.santriId
        if (santriId) {
          const res = await fetch(`/api/syahriah/santri/${santriId}`)
          if (!res.ok) {
            if (res.status === 404) {
              setError("Data santri tidak ditemukan. Silakan hubungi administrator.")
              return
            }
            throw new Error(`Syahriah API returned ${res.status}: ${res.statusText}`)
          }
          const data = await res.json()
          setSyahriahData(data.transactions || [])
          setError(null)
        }
      } catch (error) {
        console.error("Error fetching syahriah data:", error)
        setError("Gagal memuat data syahriah. Silakan coba lagi nanti.")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchSyahriah()
    }
  }, [session])

  const handlePaymentComplete = () => {
    // Refresh Syahriah data after payment
    const fetchSyahriah = async () => {
      try {
        const santriId = (session?.user as any)?.santriId
        if (santriId) {
          const res = await fetch(`/api/syahriah/santri/${santriId}`)
          if (!res.ok) {
            if (res.status === 404) {
              setError("Data santri tidak ditemukan. Silakan hubungi administrator.")
              return
            }
            throw new Error(`Syahriah API returned ${res.status}: ${res.statusText}`)
          }
          const data = await res.json()
          setSyahriahData(data.transactions || [])
          setError(null)
        }
      } catch (error) {
        console.error("Error fetching syahriah data:", error)
        setError("Gagal memuat data syahriah. Silakan coba lagi nanti.")
      }
    }
    fetchSyahriah()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LUNAS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Lunas
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600">
            <XCircle className="h-3 w-3" />
            Ditolak
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600">
            Belum Bayar
          </span>
        )
    }
  }

  if (isPending || loading) {
    return (
      <DashboardLayout activeItem="syahriah">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout activeItem="syahriah">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <XCircle className="h-16 w-16 text-destructive" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="syahriah">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Syahriah</h1>
          <p className="text-muted-foreground">
            Riwayat pembayaran syahriah santri
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Syahriah</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syahriahData.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Periode</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sudah Lunas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {syahriahData.filter((t) => t.status === "LUNAS").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Periode</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Lunas</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {syahriahData.filter((t) => t.status !== "LUNAS").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Periode</p>
            </CardContent>
          </Card>
        </div>

        {/* Syahriah List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Syahriah</CardTitle>
          </CardHeader>
          <CardContent>
            {syahriahData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data syahriah</p>
              </div>
            ) : (
              <div className="space-y-3">
                {syahriahData
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((syahriah) => (
                    <div
                      key={syahriah.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">
                            {syahriah.bulan} {syahriah.tahun}
                          </h3>
                          {getStatusBadge(syahriah.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Kode: {syahriah.kode}
                        </p>
                        {syahriah.periodePembayaran && (
                          <p className="text-sm text-muted-foreground">
                            Periode: {syahriah.periodePembayaran === "TAHUNAN" ? "Tahunan" : "Bulanan"}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(syahriah.jumlah)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(syahriah.tanggalBayar)}
                          </p>
                        </div>
                        {syahriah.status !== "LUNAS" && (
                          <PaymentButton
                            transaksiId={syahriah.id}
                            amount={syahriah.jumlah}
                            disabled={syahriah.status === "DITOLAK"}
                            onPaymentComplete={handlePaymentComplete}
                            orderId={syahriah.midtransTransactions?.[0]?.orderId}
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Calendar className="h-5 w-5" />
              Informasi Syahriah
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
            <p>• Syahriah adalah biaya bulanan untuk penginapan di asrama</p>
            <p>• Pembayaran dapat dilakukan secara bulanan atau tahunan</p>
            <p>• Hubungi bendahara untuk informasi lebih lanjut</p>
            <p>• Pastikan pembayaran tepat waktu untuk menghindari denda</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
