"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Wallet, Shirt, CheckCircle, Clock, XCircle, TrendingUp, TrendingDown } from "lucide-react"

interface DashboardData {
  totalSpp?: number
  totalUangSaku?: number
  totalLaundry?: number
  totalSyahriah?: number
  sppLunas?: number
  sppPending?: number
  uangSakuMasuk?: number
  uangSakuKeluar?: number
  laundrySelesai?: number
  laundryProses?: number
  syahriahLunas?: number
  syahriahPending?: number
}

interface DashboardContentProps {
  santriId?: string
}

export function DashboardContent({ santriId }: DashboardContentProps) {
  // Sample data - in real app, fetch from API
  const [data, setData] = React.useState<DashboardData>({
    totalSpp: 0,
    totalUangSaku: 0,
    totalLaundry: 0,
    totalSyahriah: 0,
    sppLunas: 0,
    sppPending: 0,
    uangSakuMasuk: 0,
    uangSakuKeluar: 0,
    laundrySelesai: 0,
    laundryProses: 0,
    syahriahLunas: 0,
    syahriahPending: 0,
  })

  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        if (santriId) {
          const [sppRes, uangSakuRes, laundryRes, syahriahRes] = await Promise.all([
            fetch(`/api/spp/santri/${santriId}`),
            fetch(`/api/uang-saku/santri/${santriId}`),
            fetch(`/api/laundry/santri/${santriId}`),
            fetch(`/api/syahriah/santri/${santriId}`),
          ])

          const [sppData, uangSakuData, laundryData, syahriahData] = await Promise.all([
            sppRes.json(),
            uangSakuRes.json(),
            laundryRes.json(),
            syahriahRes.json(),
          ])

          setData({
            totalSpp: sppData.length || 0,
            totalUangSaku: uangSakuData.length || 0,
            totalLaundry: laundryData.length || 0,
            totalSyahriah: syahriahData.length || 0,
            sppLunas: sppData.filter((t: any) => t.status === "LUNAS").length || 0,
            sppPending: sppData.filter((t: any) => t.status !== "LUNAS").length || 0,
            uangSakuMasuk: uangSakuData.filter((t: any) => t.statusUangSaku === "DITAMBAH").length || 0,
            uangSakuKeluar: uangSakuData.filter((t: any) => t.statusUangSaku === "DIAMBIL").length || 0,
            laundrySelesai: laundryData.filter((t: any) => t.status === "LUNAS").length || 0,
            laundryProses: laundryData.filter((t: any) => t.status !== "LUNAS").length || 0,
            syahriahLunas: syahriahData.filter((t: any) => t.status === "LUNAS").length || 0,
            syahriahPending: syahriahData.filter((t: any) => t.status !== "LUNAS").length || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [santriId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Selamat Datang!</h1>
        <p className="text-muted-foreground">
          Pantau keuangan dan aktivitas santri Anda di sini.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SPP Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SPP</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSpp}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {data.sppLunas} Lunas
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-3 w-3" />
                {data.sppPending} Pending
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Uang Saku Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uang Saku</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUangSaku}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                {data.uangSakuMasuk} Masuk
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                {data.uangSakuKeluar} Keluar
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Laundry Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laundry</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLaundry}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {data.laundrySelesai} Selesai
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-3 w-3" />
                {data.laundryProses} Proses
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Syahriah Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Syahriah</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSyahriah}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {data.syahriahLunas} Lunas
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-3 w-3" />
                {data.syahriahPending} Pending
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => (window.location.href = "/santri/spp")}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Lihat SPP</span>
            </button>
            <button
              onClick={() => (window.location.href = "/santri/uang-saku")}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Wallet className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Uang Saku</span>
            </button>
            <button
              onClick={() => (window.location.href = "/santri/laundry")}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Shirt className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Cek Laundry</span>
            </button>
            <button
              onClick={() => (window.location.href = "/santri/syahriah")}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Syahriah</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pembayaran SPP Berhasil</p>
                <p className="text-xs text-muted-foreground">Bulan Januari 2026</p>
              </div>
              <span className="text-xs text-muted-foreground">Hari ini</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Uang Saku Ditambahkan</p>
                <p className="text-xs text-muted-foreground">Rp 500.000</p>
              </div>
              <span className="text-xs text-muted-foreground">Kemarin</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Laundry Sedang Diproses</p>
                <p className="text-xs text-muted-foreground">5 potong pakaian</p>
              </div>
              <span className="text-xs text-muted-foreground">2 hari lalu</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
