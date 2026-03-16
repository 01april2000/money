"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/santri/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, CheckCircle, Clock, Package } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

interface Transaksi {
  id: string
  kode: string
  jenisLaundry: string | null
  jumlah: number
  status: string
  keterangan: string | null
  tanggalBayar: string | null
  createdAt: string
}

export default function LaundryPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [laundryData, setLaundryData] = useState<Transaksi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth")
    }
  }, [session, isPending, router])

  useEffect(() => {
    const fetchLaundry = async () => {
      try {
        const santriId = (session?.user as any)?.santriId
        if (santriId) {
          const res = await fetch(`/api/laundry/santri/${santriId}`)
          const data = await res.json()
          setLaundryData(data.transactions || [])
        }
      } catch (error) {
        console.error("Error fetching laundry data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchLaundry()
    }
  }, [session])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LUNAS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Selesai
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
            <Clock className="h-3 w-3" />
            Sedang Diproses
          </span>
        )
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600">
            <Clock className="h-3 w-3" />
            Ditolak
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600">
            <Clock className="h-3 w-3" />
            Menunggu
          </span>
        )
    }
  }

  if (isPending || loading) {
    return (
      <DashboardLayout activeItem="laundry">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout activeItem="laundry">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Laundry</h1>
          <p className="text-muted-foreground">
            Status dan riwayat laundry santri
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Laundry</CardTitle>
              <Shirt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{laundryData.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Transaksi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedang Diproses</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {laundryData.filter((t) => t.status !== "LUNAS").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Transaksi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {laundryData.filter((t) => t.status === "LUNAS").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Laundry List */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Laundry</CardTitle>
          </CardHeader>
          <CardContent>
            {laundryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada riwayat laundry</p>
              </div>
            ) : (
              <div className="space-y-3">
                {laundryData
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((laundry) => (
                    <div
                      key={laundry.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          laundry.status === "LUNAS"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                        }`}>
                          {laundry.status === "LUNAS" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {laundry.jenisLaundry || "Laundry"}
                            </h3>
                            {getStatusBadge(laundry.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Kode: {laundry.kode}
                          </p>
                          {laundry.keterangan && (
                            <p className="text-sm text-muted-foreground">
                              {laundry.keterangan}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(laundry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(laundry.jumlah)}</p>
                        {laundry.tanggalBayar && (
                          <p className="text-xs text-muted-foreground">
                            Selesai: {formatDate(laundry.tanggalBayar)}
                          </p>
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
              <Package className="h-5 w-5" />
              Informasi Laundry
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
            <p>• Pastikan pakaian sudah dipisahkan sesuai jenis (putih, berwarna, dll)</p>
            <p>• Beri label pada pakaian untuk memudahkan identifikasi</p>
            <p>• Status laundry akan diperbarui secara berkala</p>
            <p>• Hubungi petugas laundry jika ada pertanyaan</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
