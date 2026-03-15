"use client"

import * as React from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Receipt,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

interface DashboardContentProps {
  activeItem: string
  dashboardData?: {
    stats?: {
      totalSantri: number
      incomeThisMonth: number
      pendingTransactions: number
      unpaidTransactions: number
    }
    recentTransactions?: Array<{
      id: string
      namaSantri: string
      jenis: string
      jumlah: string
      status: string
      tanggal: string
      kode: string
      nis: string
      kelas: string
    }>
    santri?: Array<{
      id: string
      nis: string
      nama: string
      kelas: string
      asrama: string
      wali: string
      status: string
      email: string
      beasiswa?: boolean
      jenisBeasiswa?: string
      jenisSantri?: string
    }>
    sppTransactions?: Array<{
      id: string
      kode: string
      namaSantri: string
      nis: string
      kelas: string
      asrama: string
      bulan: string
      periodePembayaran: string
      tahun: string
      jumlah: string
      tanggalBayar: string
      keterangan: string
      createdAt: string
      status: string
      _raw?: any
    }>
    syahriahTransactions?: Array<{
      id: string
      kode: string
      namaSantri: string
      nis: string
      kelas: string
      asrama: string
      bulan: string
      periodePembayaran: string
      tahun: string
      jumlah: string
      tanggalBayar: string
      keterangan: string
      createdAt: string
      status: string
      _raw?: any
    }>
    financialSummary?: {
      totalIncome: string
      monthlyIncome: Record<string, number>
      transactionByType: Array<{
        jenis: string
        count: number
        total: string
      }>
    }
  }
}

// Helper function to get status badge color
function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "LUNAS":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "BELUM_BAYAR":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "DITOLAK":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "AKTIF":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "NON_AKTIF":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    case "LULUS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "KELUAR":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  }
}

// Helper function to get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case "LUNAS":
      return <CheckCircle className="h-3 w-3" />
    case "PENDING":
      return <Clock className="h-3 w-3" />
    case "BELUM_BAYAR":
    case "DITOLAK":
      return <XCircle className="h-3 w-3" />
    default:
      return null
  }
}

export function DashboardContent({ activeItem, dashboardData }: DashboardContentProps) {
  switch (activeItem) {
    case "dashboard":
      return <DashboardHome dashboardData={dashboardData} />
    case "santri-management":
      return <SantriManagement dashboardData={dashboardData} />
    case "spp":
      return <SPPManagement dashboardData={dashboardData} />
    case "syahriah":
      return <SyahriahManagement dashboardData={dashboardData} />
    case "keuangan":
      return <Keuangan dashboardData={dashboardData} />
    default:
      return <DashboardHome dashboardData={dashboardData} />
  }
}

// Dashboard Home
function DashboardHome({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const stats = dashboardData?.stats
  const recentTransactions = dashboardData?.recentTransactions || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di panel Bendahara SMK</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSantri ?? 0}</div>
            <p className="text-xs text-muted-foreground">Santri SMK aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.incomeThisMonth 
                ? new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(stats.incomeThisMonth)
                : "Rp 0"}
            </div>
            <p className="text-xs text-muted-foreground">Dari SPP & Syahriah</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Konfirmasi</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTransactions ?? 0}</div>
            <p className="text-xs text-muted-foreground">Transaksi pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unpaidTransactions ?? 0}</div>
            <p className="text-xs text-muted-foreground">Transaksi belum dibayar</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Transaksi pembayaran terbaru dari santri SMK</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Belum ada transaksi
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-xs">{trx.kode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trx.namaSantri}</div>
                        <div className="text-xs text-muted-foreground">{trx.nis} - {trx.kelas}</div>
                      </div>
                    </TableCell>
                    <TableCell>{trx.jenis}</TableCell>
                    <TableCell className="font-medium">{trx.jumlah}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(trx.status)}`}>
                        {getStatusIcon(trx.status)}
                        {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>{trx.tanggal}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Santri Management
function SantriManagement({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const santri = dashboardData?.santri || []
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredSantri = santri.filter((s) =>
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Santri SMK</h1>
        <p className="text-muted-foreground">Kelola data santri SMK</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
          <CardDescription>Total {santri.length} santri SMK</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari santri berdasarkan nama, NIS, atau kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Asrama</TableHead>
                <TableHead>Wali</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Beasiswa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSantri.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Tidak ada santri yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredSantri.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                    <TableCell className="font-medium">{s.nama}</TableCell>
                    <TableCell>{s.kelas}</TableCell>
                    <TableCell>{s.asrama}</TableCell>
                    <TableCell>{s.wali}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(s.status)}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {s.beasiswa ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {s.jenisBeasiswa || "Ya"}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                          Tidak
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// SPP Management
function SPPManagement({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const initialTransactions = dashboardData?.sppTransactions || []
  const [transactions, setTransactions] = React.useState(initialTransactions)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false)
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [santriList, setSantriList] = React.useState<any[]>([])
  const [formData, setFormData] = React.useState({
    santriId: "",
    bulan: "",
    jumlah: "",
    status: "BELUM_BAYAR",
    tanggalBayar: "",
    keterangan: "",
  })
  const [editFormData, setEditFormData] = React.useState({
    id: "",
    santriId: "",
    bulan: "",
    jumlah: "",
    status: "BELUM_BAYAR",
    tanggalBayar: "",
    keterangan: "",
  })

  // Fetch santri list on mount
  React.useEffect(() => {
    fetch("/api/santri")
      .then(res => res.json())
      .then(data => setSantriList(data.filter((s: any) => s.jenisSantri === "SMK")))
      .catch(err => console.error("Failed to fetch santri:", err))
  }, [])

  const filteredTransactions = transactions.filter((trx) =>
    trx.namaSantri.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.kode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/spp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          jumlah: parseInt(formData.jumlah),
          tanggalBayar: formData.tanggalBayar ? new Date(formData.tanggalBayar) : null,
        }),
      })

      const newTrx = await response.json()

      if (!response.ok) {
        throw new Error(newTrx.error || "Failed to create SPP transaction")
      }

      toast.success("Transaksi SPP berhasil ditambahkan!")
      
      // Refresh transactions
      const refreshResponse = await fetch("/api/spp")
      const allTransactions = await refreshResponse.json()
      const formattedTransactions = allTransactions.map((trx: any) => ({
        id: trx.id,
        kode: trx.kode || "-",
        namaSantri: trx.santri.nama,
        nis: trx.santri.nis || "-",
        kelas: trx.santri.kelas || "-",
        asrama: trx.santri.asrama || "-",
        bulan: trx.bulan || "-",
        periodePembayaran: trx.periodePembayaran || "-",
        tahun: trx.tahun || "-",
        jumlah: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(trx.jumlah),
        tanggalBayar: trx.tanggalBayar ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(trx.tanggalBayar)) : "-",
        keterangan: trx.keterangan || "-",
        createdAt: trx.createdAt ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(trx.createdAt)) : "-",
        status: trx.status,
        _raw: trx,
      }))
      setTransactions(formattedTransactions.filter((t: any) => t._raw.santri?.jenisSantri === "SMK"))
      
      setFormData({
        santriId: "",
        bulan: "",
        jumlah: "",
        status: "BELUM_BAYAR",
        tanggalBayar: "",
        keterangan: "",
      })
      setIsAddDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (trxId: string) => {
    toast.promise(
      async () => {
        const response = await fetch(`/api/spp/${trxId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Gagal menghapus transaksi SPP")
        }

        return response.json()
      },
      {
        loading: "Menghapus transaksi...",
        success: () => {
          setTransactions(prev => prev.filter(t => t.id !== trxId))
          return "Transaksi SPP berhasil dihapus!"
        },
        error: "Gagal menghapus transaksi SPP",
      }
    )
  }

  const handleEdit = (trx: any) => {
    setEditFormData({
      id: trx.id,
      santriId: trx._raw.santriId,
      bulan: trx._raw.bulan || "",
      jumlah: String(trx._raw.jumlah),
      status: trx._raw.status,
      tanggalBayar: trx._raw.tanggalBayar ? new Date(trx._raw.tanggalBayar).toISOString().split('T')[0] : "",
      keterangan: trx._raw.keterangan || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleViewDetail = (trx: any) => {
    setSelectedTransaction(trx)
    setIsDetailDialogOpen(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/spp/${editFormData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editFormData,
          jumlah: parseInt(editFormData.jumlah),
          tanggalBayar: editFormData.tanggalBayar ? new Date(editFormData.tanggalBayar) : null,
        }),
      })

      const updatedTrx = await response.json()

      if (!response.ok) {
        throw new Error(updatedTrx.error || "Failed to update SPP transaction")
      }

      toast.success("Transaksi SPP berhasil diperbarui!")
      
      // Refresh transactions
      const refreshResponse = await fetch("/api/spp")
      const allTransactions = await refreshResponse.json()
      const formattedTransactions = allTransactions.map((trx: any) => ({
        id: trx.id,
        kode: trx.kode || "-",
        namaSantri: trx.santri.nama,
        nis: trx.santri.nis || "-",
        kelas: trx.santri.kelas || "-",
        asrama: trx.santri.asrama || "-",
        bulan: trx.bulan || "-",
        periodePembayaran: trx.periodePembayaran || "-",
        tahun: trx.tahun || "-",
        jumlah: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(trx.jumlah),
        tanggalBayar: trx.tanggalBayar ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(trx.tanggalBayar)) : "-",
        keterangan: trx.keterangan || "-",
        createdAt: trx.createdAt ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(trx.createdAt)) : "-",
        status: trx.status,
        _raw: trx,
      }))
      setTransactions(formattedTransactions.filter((t: any) => t._raw.santri?.jenisSantri === "SMK"))
      
      setIsEditDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/spp/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Gagal mengupdate status")

      toast.success("Status berhasil diupdate")
      
      // Refresh transactions
      const refreshResponse = await fetch("/api/spp")
      const allTransactions = await refreshResponse.json()
      const formattedTransactions = allTransactions.map((trx: any) => ({
        id: trx.id,
        kode: trx.kode || "-",
        namaSantri: trx.santri.nama,
        nis: trx.santri.nis || "-",
        kelas: trx.santri.kelas || "-",
        asrama: trx.santri.asrama || "-",
        bulan: trx.bulan || "-",
        periodePembayaran: trx.periodePembayaran || "-",
        tahun: trx.tahun || "-",
        jumlah: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(trx.jumlah),
        tanggalBayar: trx.tanggalBayar ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(trx.tanggalBayar)) : "-",
        keterangan: trx.keterangan || "-",
        createdAt: trx.createdAt ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(trx.createdAt)) : "-",
        status: trx.status,
        _raw: trx,
      }))
      setTransactions(formattedTransactions.filter((t: any) => t._raw.santri?.jenisSantri === "SMK"))
    } catch (error) {
      toast.error("Gagal mengupdate status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen SPP</h1>
          <p className="text-muted-foreground">Kelola pembayaran SPP santri SMK</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Transaksi SPP</DialogTitle>
              <DialogDescription>
                Masukkan data pembayaran SPP baru.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="santriId">Santri</Label>
                  <select
                    id="santriId"
                    name="santriId"
                    value={formData.santriId}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Pilih Santri</option>
                    {santriList.map((santri) => (
                      <option key={santri.id} value={santri.id}>
                        {santri.nama} ({santri.nis})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulan">Bulan</Label>
                  <Input
                    id="bulan"
                    name="bulan"
                    value={formData.bulan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Januari 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah">Jumlah</Label>
                  <Input
                    id="jumlah"
                    name="jumlah"
                    type="number"
                    value={formData.jumlah}
                    onChange={handleInputChange}
                    placeholder="Contoh: 500000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="BELUM_BAYAR">Belum Bayar</option>
                    <option value="PENDING">Pending</option>
                    <option value="LUNAS">Lunas</option>
                    <option value="DITOLAK">Ditolak</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalBayar">Tanggal Bayar</Label>
                  <Input
                    id="tanggalBayar"
                    name="tanggalBayar"
                    type="date"
                    value={formData.tanggalBayar}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Input
                    id="keterangan"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleInputChange}
                    placeholder="Keterangan tambahan"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi SPP</CardTitle>
          <CardDescription>Total {transactions.length} transaksi SPP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi SPP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Tidak ada transaksi SPP yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-xs">{trx.kode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trx.namaSantri}</div>
                        <div className="text-xs text-muted-foreground">{trx.nis}</div>
                      </div>
                    </TableCell>
                    <TableCell>{trx.kelas}</TableCell>
                    <TableCell>
                      <div>
                        <div>{trx.bulan || "-"}</div>
                        <div className="text-xs text-muted-foreground">{trx.tahun}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{trx.jumlah}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(trx.status)}`}>
                        {getStatusIcon(trx.status)}
                        {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {trx.status === "BELUM_BAYAR" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(trx.id, "LUNAS")}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Lunas
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetail(trx)}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(trx)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(trx.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Transaksi SPP</DialogTitle>
            <DialogDescription>
              Informasi lengkap transaksi pembayaran SPP.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Kode Transaksi</Label>
                  <p className="font-mono text-sm">{selectedTransaction.kode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nama Santri</Label>
                  <p>{selectedTransaction.namaSantri}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">NIS</Label>
                  <p>{selectedTransaction.nis}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kelas</Label>
                  <p>{selectedTransaction.kelas}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Asrama</Label>
                  <p>{selectedTransaction.asrama}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bulan</Label>
                  <p>{selectedTransaction.bulan}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Periode Pembayaran</Label>
                  <p>{selectedTransaction.periodePembayaran}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tahun</Label>
                  <p>{selectedTransaction.tahun}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Jumlah</Label>
                  <p className="font-semibold">{selectedTransaction.jumlah}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tanggal Bayar</Label>
                  <p>{selectedTransaction.tanggalBayar}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dibuat</Label>
                  <p className="text-xs">{selectedTransaction.createdAt}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Keterangan</Label>
                  <p className="text-sm">{selectedTransaction.keterangan}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaksi SPP</DialogTitle>
            <DialogDescription>
              Ubah data pembayaran SPP.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-santriId">Santri</Label>
                <select
                  id="edit-santriId"
                  name="santriId"
                  value={editFormData.santriId}
                  onChange={handleEditInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih Santri</option>
                  {santriList.map((santri) => (
                    <option key={santri.id} value={santri.id}>
                      {santri.nama} ({santri.nis})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bulan">Bulan</Label>
                <Input
                  id="edit-bulan"
                  name="bulan"
                  value={editFormData.bulan}
                  onChange={handleEditInputChange}
                  placeholder="Contoh: Januari 2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jumlah">Jumlah</Label>
                <Input
                  id="edit-jumlah"
                  name="jumlah"
                  type="number"
                  value={editFormData.jumlah}
                  onChange={handleEditInputChange}
                  placeholder="Contoh: 500000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BELUM_BAYAR">Belum Bayar</option>
                  <option value="PENDING">Pending</option>
                  <option value="LUNAS">Lunas</option>
                  <option value="DITOLAK">Ditolak</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tanggalBayar">Tanggal Bayar</Label>
                <Input
                  id="edit-tanggalBayar"
                  name="tanggalBayar"
                  type="date"
                  value={editFormData.tanggalBayar}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-keterangan">Keterangan</Label>
                <Input
                  id="edit-keterangan"
                  name="keterangan"
                  value={editFormData.keterangan}
                  onChange={handleEditInputChange}
                  placeholder="Keterangan tambahan"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Syahriah Management
function SyahriahManagement({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const transactions = dashboardData?.syahriahTransactions || []
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedTransaction, setSelectedTransaction] = React.useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const filteredTransactions = transactions.filter((trx) =>
    trx.namaSantri.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.kode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/syahriah/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Gagal mengupdate status")

      toast.success("Status berhasil diupdate")
      window.location.reload()
    } catch (error) {
      toast.error("Gagal mengupdate status")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Syahriah</h1>
        <p className="text-muted-foreground">Kelola pembayaran Syahriah santri SMK</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi Syahriah</CardTitle>
          <CardDescription>Total {transactions.length} transaksi Syahriah</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi Syahriah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Asrama</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Tidak ada transaksi Syahriah yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-xs">{trx.kode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trx.namaSantri}</div>
                        <div className="text-xs text-muted-foreground">{trx.nis}</div>
                      </div>
                    </TableCell>
                    <TableCell>{trx.asrama}</TableCell>
                    <TableCell>
                      <div>
                        <div>{trx.bulan || "-"}</div>
                        <div className="text-xs text-muted-foreground">{trx.tahun}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{trx.jumlah}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(trx.status)}`}>
                        {getStatusIcon(trx.status)}
                        {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {trx.status === "BELUM_BAYAR" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(trx.id, "LUNAS")}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Lunas
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTransaction(trx)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Transaksi Syahriah</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kode</Label>
                  <p className="font-mono text-sm">{selectedTransaction.kode}</p>
                </div>
                <div>
                  <Label>Nama Santri</Label>
                  <p className="text-sm">{selectedTransaction.namaSantri}</p>
                </div>
                <div>
                  <Label>NIS</Label>
                  <p className="text-sm">{selectedTransaction.nis}</p>
                </div>
                <div>
                  <Label>Asrama</Label>
                  <p className="text-sm">{selectedTransaction.asrama}</p>
                </div>
                <div>
                  <Label>Bulan</Label>
                  <p className="text-sm">{selectedTransaction.bulan || "-"}</p>
                </div>
                <div>
                  <Label>Tahun</Label>
                  <p className="text-sm">{selectedTransaction.tahun}</p>
                </div>
                <div>
                  <Label>Jumlah</Label>
                  <p className="text-sm font-medium">{selectedTransaction.jumlah}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm">{selectedTransaction.status}</p>
                </div>
                <div className="col-span-2">
                  <Label>Keterangan</Label>
                  <p className="text-sm">{selectedTransaction.keterangan || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Keuangan
function Keuangan({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const financialSummary = dashboardData?.financialSummary

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
        <p className="text-muted-foreground">Ringkasan keuangan SPP & Syahriah SMK</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Pendapatan Tahun Ini</CardTitle>
            <CardDescription>Dari SPP & Syahriah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{financialSummary?.totalIncome || "Rp 0"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendapatan per Jenis</CardTitle>
            <CardDescription>Breakdown berdasarkan jenis transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {financialSummary?.transactionByType?.map((item) => (
                <div key={item.jenis} className="flex justify-between items-center">
                  <span className="text-sm">{item.jenis}</span>
                  <div className="text-right">
                    <div className="font-medium">{item.total}</div>
                    <div className="text-xs text-muted-foreground">{item.count} transaksi</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pendapatan Bulanan</CardTitle>
          <CardDescription>Tren pendapatan bulanan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(financialSummary?.monthlyIncome || {}).map(([month, amount]) => (
              <div key={month} className="flex justify-between items-center">
                <span className="text-sm">{month}</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
