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
  const transactions = dashboardData?.sppTransactions || []
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
      const response = await fetch(`/api/spp/${id}`, {
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
        <h1 className="text-3xl font-bold">Manajemen SPP</h1>
        <p className="text-muted-foreground">Kelola pembayaran SPP santri SMK</p>
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
            <DialogTitle>Detail Transaksi SPP</DialogTitle>
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
                  <Label>Kelas</Label>
                  <p className="text-sm">{selectedTransaction.kelas}</p>
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
