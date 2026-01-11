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
  UserPlus,
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Receipt,
  DollarSign,
  Shirt,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

interface DashboardContentProps {
  activeItem: string
  dashboardData?: {
    stats?: {
      totalSantri: number
      incomeThisMonth: number
      expensesThisMonth: number
      pendingTransactions: number
    }
    recentTransactions?: Array<{
      id: string
      namaSantri: string
      jenis: string
      jumlah: string
      status: string
      tanggal: string
    }>
    users?: Array<{
      id: string
      name: string
      email: string
      role: string
      status: string
    }>
    santri?: Array<{
      id: string
      nis: string
      nama: string
      kelas: string
      asrama: string
      wali: string
      status: string
    }>
    sppTransactions?: Array<{
      id: string
      namaSantri: string
      bulan: string
      jumlah: string
      tanggalBayar: string
      status: string
    }>
    syahriahTransactions?: Array<{
      id: string
      namaSantri: string
      bulan: string
      jumlah: string
      tanggalBayar: string
      status: string
    }>
    uangSakuTransactions?: Array<{
      id: string
      namaSantri: string
      jumlah: string
      tanggal: string
      status: string
    }>
    laundryTransactions?: Array<{
      id: string
      namaSantri: string
      jenisLaundry: string
      jumlah: string
      tanggal: string
      status: string
    }>
    financialSummary?: {
      totalIncome: string
      totalExpenses: string
      balance: string
      monthlyIncome: Array<{
        month: string
        income: string
        expenses: string
        balance: string
      }>
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
    case "Lunas":
      return "bg-green-100 text-green-700"
    case "PENDING":
    case "Pending":
      return "bg-yellow-100 text-yellow-700"
    case "BELUM_BAYAR":
    case "Belum Bayar":
      return "bg-red-100 text-red-700"
    case "DITOLAK":
      return "bg-red-100 text-red-700"
    case "CAIR":
    case "Cair":
      return "bg-green-100 text-green-700"
    case "AKTIF":
    case "Aktif":
      return "bg-green-100 text-green-700"
    case "NON_AKTIF":
    case "Tidak Aktif":
      return "bg-gray-100 text-gray-700"
    case "LULUS":
      return "bg-blue-100 text-blue-700"
    case "KELUAR":
      return "bg-orange-100 text-orange-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

// Helper function to get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case "LUNAS":
    case "Lunas":
    case "CAIR":
    case "Cair":
      return <CheckCircle className="h-3 w-3" />
    case "PENDING":
    case "Pending":
      return <Clock className="h-3 w-3" />
    case "BELUM_BAYAR":
    case "Belum Bayar":
    case "DITOLAK":
      return <XCircle className="h-3 w-3" />
    default:
      return null
  }
}

// Helper function to get status text color
function getStatusTextColor(status: string): string {
  switch (status) {
    case "LUNAS":
    case "Lunas":
    case "CAIR":
    case "Cair":
      return "text-green-600"
    case "PENDING":
    case "Pending":
      return "text-yellow-600"
    case "BELUM_BAYAR":
    case "Belum Bayar":
    case "DITOLAK":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export function DashboardContent({ activeItem, dashboardData }: DashboardContentProps) {
  switch (activeItem) {
    case "dashboard":
      return <DashboardHome dashboardData={dashboardData} />
    case "user-management":
      return <UserManagement dashboardData={dashboardData} />
    case "santri-management":
      return <SantriManagement dashboardData={dashboardData} />
    case "spp":
      return <SPPManagement dashboardData={dashboardData} />
    case "syahriah":
      return <SyahriahManagement dashboardData={dashboardData} />
    case "uang-saku":
      return <UangSakuManagement dashboardData={dashboardData} />
    case "laundry":
      return <LaundryManagement dashboardData={dashboardData} />
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
        <p className="text-muted-foreground">Selamat datang di panel admin Money Management</p>
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
            <p className="text-xs text-muted-foreground">Santri aktif</p>
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
                : "Rp 0"
              }
            </div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.expensesThisMonth
                ? new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(stats.expensesThisMonth)
                : "Rp 0"
              }
            </div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTransactions ?? 0}</div>
            <p className="text-xs text-muted-foreground">Perlu diproses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir yang masuk</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell>#{trx.id}</TableCell>
                    <TableCell>{trx.namaSantri}</TableCell>
                    <TableCell>{trx.jenis}</TableCell>
                    <TableCell>{trx.jumlah}</TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 ${getStatusTextColor(trx.status)}`}>
                        {getStatusIcon(trx.status)} {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>{trx.tanggal}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Belum ada data transaksi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// User Management
function UserManagement({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const users = dashboardData?.users || []
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: "SANTRI",
    password: "",
  })
  const [editFormData, setEditFormData] = React.useState({
    id: "",
    name: "",
    email: "",
    role: "SANTRI",
  })
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      setSuccess("User berhasil ditambahkan!")
      setFormData({ name: "", email: "", role: "SANTRI", password: "" })
      
      // Refresh the page to show the new user
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (userId: string) => {
    toast.promise(
      async () => {
        const response = await fetch(`/api/users?id=${userId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Gagal menghapus user")
        }

        return response.json()
      },
      {
        loading: "Menghapus user...",
        success: () => {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
          return "User berhasil dihapus!"
        },
        error: "Gagal menghapus user",
      }
    )
  }

  const handleEdit = (user: { id: string; name: string; email: string; role: string }) => {
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/users?id=${editFormData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      toast.success("User berhasil diperbarui!")
      setIsEditDialogOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Kelola semua pengguna sistem</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Masukkan data user baru untuk menambahkan ke sistem.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contoh@email.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="BENDAHARA_SMK">Bendahara SMK</option>
                    <option value="BENDAHARA_SMP">Bendahara SMP</option>
                    <option value="BENDAHARA_PONDOK">Bendahara Pondok</option>
                    <option value="SANTRI">Santri</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Masukkan password"
                    required
                    minLength={6}
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                {success && (
                  <div className="text-sm text-green-600">{success}</div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Ubah data user yang ada di sistem.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nama</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    placeholder="contoh@email.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <select
                    id="edit-role"
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="BENDAHARA_SMK">Bendahara SMK</option>
                    <option value="BENDAHARA_SMP">Bendahara SMP</option>
                    <option value="BENDAHARA_PONDOK">Bendahara Pondok</option>
                    <option value="SANTRI">Santri</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
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
          <CardTitle>Daftar User</CardTitle>
          <CardDescription>Kelola akses dan role pengguna</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari user..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {searchQuery ? "Tidak ada user yang cocok" : "Belum ada data user"}
                  </TableCell>
                </TableRow>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Management Santri</h1>
          <p className="text-muted-foreground">Kelola data santri pondok</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Santri
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
          <CardDescription>Kelola data santri aktif</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari santri..." className="pl-8" />
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
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {santri.length > 0 ? (
                santri.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.nis}</TableCell>
                    <TableCell>{s.nama}</TableCell>
                    <TableCell>{s.kelas}</TableCell>
                    <TableCell>{s.asrama}</TableCell>
                    <TableCell>{s.wali}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(s.status)}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Belum ada data santri
                  </TableCell>
                </TableRow>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pembayaran SPP</h1>
          <p className="text-muted-foreground">Kelola pembayaran SPP santri</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran SPP</CardTitle>
          <CardDescription>Riwayat pembayaran SPP santri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Bulan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal Bayar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell>#{trx.id}</TableCell>
                    <TableCell>{trx.namaSantri}</TableCell>
                    <TableCell>{trx.bulan}</TableCell>
                    <TableCell>{trx.jumlah}</TableCell>
                    <TableCell>{trx.tanggalBayar}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(trx.status)}`}>
                        {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Belum ada data pembayaran SPP
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Syahriah Management
function SyahriahManagement({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const transactions = dashboardData?.syahriahTransactions || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pembayaran Syahriah</h1>
          <p className="text-muted-foreground">Kelola pembayaran syahriah santri</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran Syahriah</CardTitle>
          <CardDescription>Riwayat pembayaran syahriah santri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Bulan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal Bayar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell>#{trx.id}</TableCell>
                    <TableCell>{trx.namaSantri}</TableCell>
                    <TableCell>{trx.bulan}</TableCell>
                    <TableCell>{trx.jumlah}</TableCell>
                    <TableCell>{trx.tanggalBayar}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(trx.status)}`}>
                        {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Belum ada data pembayaran Syahriah
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Uang Saku Management
function UangSakuManagement({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const transactions = dashboardData?.uangSakuTransactions || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uang Saku</h1>
          <p className="text-muted-foreground">Kelola pencairan uang saku santri</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pencairan Uang Saku</CardTitle>
          <CardDescription>Riwayat pencairan uang saku santri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell>#{trx.id}</TableCell>
                    <TableCell>{trx.namaSantri}</TableCell>
                    <TableCell>{trx.jumlah}</TableCell>
                    <TableCell>{trx.tanggal}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(trx.status)}`}>
                        {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Belum ada data pencairan uang saku
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Laundry Management
function LaundryManagement({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const transactions = dashboardData?.laundryTransactions || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laundry</h1>
          <p className="text-muted-foreground">Kelola transaksi laundry santri</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi Laundry</CardTitle>
          <CardDescription>Riwayat transaksi laundry santri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell>#{trx.id}</TableCell>
                    <TableCell>{trx.namaSantri}</TableCell>
                    <TableCell>{trx.jenisLaundry}</TableCell>
                    <TableCell>{trx.jumlah}</TableCell>
                    <TableCell>{trx.tanggal}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(trx.status)}`}>
                        {trx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Belum ada data transaksi laundry
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Keuangan (Finance)
function Keuangan({ dashboardData }: { dashboardData?: DashboardContentProps["dashboardData"] }) {
  const summary = dashboardData?.financialSummary

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Keuangan</h1>
        <p className="text-muted-foreground">Rekapitulasi keuangan pondok</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalIncome ?? "Rp 0"}</div>
            <p className="text-xs text-muted-foreground">Tahun ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalExpenses ?? "Rp 0"}</div>
            <p className="text-xs text-muted-foreground">Tahun ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.balance ?? "Rp 0"}</div>
            <p className="text-xs text-muted-foreground">Saat ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap Bulanan</CardTitle>
          <CardDescription>Ringkasan transaksi per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bulan</TableHead>
                <TableHead>Pendapatan</TableHead>
                <TableHead>Pengeluaran</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.monthlyIncome && summary.monthlyIncome.length > 0 ? (
                summary.monthlyIncome.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell className="text-green-600">{item.income}</TableCell>
                    <TableCell className="text-red-600">{item.expenses}</TableCell>
                    <TableCell className="font-medium">{item.balance}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Belum ada data bulanan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Breakdown by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap per Jenis Transaksi</CardTitle>
          <CardDescription>Ringkasan transaksi berdasarkan jenis pembayaran</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Transaksi</TableHead>
                <TableHead>Total Transaksi</TableHead>
                <TableHead>Total Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.transactionByType && summary.transactionByType.length > 0 ? (
                summary.transactionByType.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.jenis}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Belum ada data transaksi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
