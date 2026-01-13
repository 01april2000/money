"use client"

import * as React from "react"
import * as XLSX from "xlsx"
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
  XCircle,
  Upload,
  Download
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
      email: string
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
  const initialUsers = dashboardData?.users || []
  const [users, setUsers] = React.useState(initialUsers)
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

      const newUser = await response.json()

      if (!response.ok) {
        throw new Error(newUser.error || "Failed to create user")
      }

      setSuccess("User berhasil ditambahkan!")
      setUsers(prev => [newUser, ...prev])
      setFormData({ name: "", email: "", role: "SANTRI", password: "" })
      setIsAddDialogOpen(false)
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
          setUsers(prev => prev.filter(user => user.id !== userId))
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

      const updatedUser = await response.json()

      if (!response.ok) {
        throw new Error(updatedUser.error || "Failed to update user")
      }

      setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user))
      toast.success("User berhasil diperbarui!")
      setIsEditDialogOpen(false)
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
  const initialSantri = dashboardData?.santri || []
  const [santri, setSantri] = React.useState(initialSantri)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"manual" | "excel">("manual")
  const [excelFile, setExcelFile] = React.useState<File | null>(null)
  const [parsedData, setParsedData] = React.useState<any[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    nis: "",
    nama: "",
    kelas: "",
    asrama: "",
    wali: "",
    status: "AKTIF",
    email: "",
    password: "",
  })
  const [editFormData, setEditFormData] = React.useState({
    id: "",
    nis: "",
    nama: "",
    kelas: "",
    asrama: "",
    wali: "",
    status: "AKTIF",
    email: "",
    password: "",
  })
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredSantri = santri.filter(s =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.asrama.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/santri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const newSantri = await response.json()

      if (!response.ok) {
        throw new Error(newSantri.error || "Failed to create santri")
      }

      toast.success("Santri berhasil ditambahkan!")
      setSantri(prev => [newSantri, ...prev])
      setFormData({ nis: "", nama: "", kelas: "", asrama: "", wali: "", status: "AKTIF", email: "", password: "" })
      setIsAddDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (santriId: string) => {
    toast.promise(
      async () => {
        const response = await fetch(`/api/santri?id=${santriId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Gagal menghapus santri")
        }

        return response.json()
      },
      {
        loading: "Menghapus santri...",
        success: () => {
          setSantri(prev => prev.filter(s => s.id !== santriId))
          return "Santri berhasil dihapus!"
        },
        error: "Gagal menghapus santri",
      }
    )
  }

  const handleEdit = (s: { id: string; nis: string; nama: string; kelas: string; asrama: string; wali: string; status: string; email?: string }) => {
    setEditFormData({
      id: s.id,
      nis: s.nis,
      nama: s.nama,
      kelas: s.kelas,
      asrama: s.asrama,
      wali: s.wali,
      status: s.status,
      email: s.email || "",
      password: "",
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
      const response = await fetch(`/api/santri?id=${editFormData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      })

      const updatedSantri = await response.json()

      if (!response.ok) {
        throw new Error(updatedSantri.error || "Failed to update santri")
      }

      setSantri(prev => prev.map(s => s.id === updatedSantri.id ? updatedSantri : s))
      toast.success("Santri berhasil diperbarui!")
      setIsEditDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setExcelFile(file)
      setIsUploading(true)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = event.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)
          
          // Validate and transform data
          const validData = jsonData.map((row: any) => ({
            nis: String(row.nis || row.NIS || row["NIS"] || ""),
            nama: String(row.nama || row.Nama || row["Nama"] || ""),
            kelas: String(row.kelas || row.Kelas || row["Kelas"] || ""),
            asrama: String(row.asrama || row["Nomer Kamar"] || row["Nomer_Kamar"] || row["NomerKamar"] || row.kamar || row.Kamar || row["Kamar"] || ""),
            wali: String(row.wali || row.Wali || row["Wali"] || ""),
            status: String(row.status || row.Status || row["Status"] || "AKTIF").toUpperCase(),
            email: String(row.email || row.Email || row["Email"] || ""),
            password: String(row.password || row.Password || row["Password"] || "123456"),
          })).filter(item => item.nis && item.nama && item.kelas && item.asrama && item.wali && item.email)

          setParsedData(validData)
          setIsUploading(false)
          toast.success(`Berhasil memuat ${validData.length} data santri`)
        } catch (err) {
          setIsUploading(false)
          toast.error("Gagal membaca file Excel. Pastikan format file benar.")
        }
      }
      reader.readAsBinaryString(file)
    }
  }

  // Handle bulk import
  const handleBulkImport = async () => {
    if (parsedData.length === 0) {
      toast.error("Tidak ada data untuk diimpor")
      return
    }

    setIsSubmitting(true)
    try {
      const importResponse = await fetch("/api/santri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bulk: true,
          santri: parsedData,
        }),
      })

      const result = await importResponse.json()

      if (!importResponse.ok) {
        throw new Error(result.error || "Failed to import santri")
      }

      toast.success(`Berhasil mengimpor ${result.success} santri. ${result.failed} gagal.`)
      // Refresh data by fetching from API
      const refreshResponse = await fetch("/api/santri")
      const allSantri = await refreshResponse.json()
      setSantri(allSantri)
      setParsedData([])
      setExcelFile(null)
      setIsAddDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Download Excel template
  const downloadTemplate = () => {
    const template = [
      {
        NIS: "12345",
        Nama: "Contoh Nama Santri",
        Kelas: "10A",
        Nomer_Kamar: "A1",
        Wali: "Nama Wali",
        Status: "AKTIF",
        Email: "contoh@email.com",
        Password: "123456",
      },
    ]
    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
    XLSX.writeFile(workbook, "template_santri.xlsx")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Management Santri</h1>
          <p className="text-muted-foreground">Kelola data santri pondok</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Santri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Santri Baru</DialogTitle>
              <DialogDescription>
                Masukkan data santri baru untuk menambahkan ke sistem.
              </DialogDescription>
            </DialogHeader>
            
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "manual"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Input Manual
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("excel")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "excel"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Import Excel
              </button>
            </div>

            {/* Manual Input Form */}
            {activeTab === "manual" && (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nis">NIS</Label>
                    <Input
                      id="nis"
                      name="nis"
                      value={formData.nis}
                      onChange={handleInputChange}
                      placeholder="Masukkan NIS"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nama">Nama</Label>
                    <Input
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kelas">Kelas</Label>
                    <Input
                      id="kelas"
                      name="kelas"
                      value={formData.kelas}
                      onChange={handleInputChange}
                      placeholder="Masukkan kelas"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="asrama">Nomer Kamar</Label>
                    <Input
                      id="asrama"
                      name="asrama"
                      value={formData.asrama}
                      onChange={handleInputChange}
                      placeholder="Masukkan nomer kamar"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wali">Wali</Label>
                    <Input
                      id="wali"
                      name="wali"
                      value={formData.wali}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama wali"
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
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="AKTIF">Aktif</option>
                      <option value="NON_AKTIF">Tidak Aktif</option>
                      <option value="LULUS">Lulus</option>
                      <option value="KELUAR">Keluar</option>
                    </select>
                  </div>
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
            )}

            {/* Excel Import Form */}
            {activeTab === "excel" && (
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Upload file Excel (.xlsx) untuk menambahkan banyak santri sekaligus.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">
                    {excelFile ? excelFile.name : "Pilih file Excel"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Format file: .xlsx dengan kolom NIS, Nama, Kelas, Nomer_Kamar, Wali, Status, Email, Password
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                  >
                    {isUploading ? "Memuat..." : "Pilih File"}
                  </label>
                </div>

                {/* Preview Table */}
                {parsedData.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">
                      Preview Data ({parsedData.length} santri)
                    </h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">NIS</TableHead>
                            <TableHead className="text-xs">Nama</TableHead>
                            <TableHead className="text-xs">Kelas</TableHead>
                            <TableHead className="text-xs">Kamar</TableHead>
                            <TableHead className="text-xs">Wali</TableHead>
                            <TableHead className="text-xs">Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.slice(0, 10).map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-xs">{item.nis}</TableCell>
                              <TableCell className="text-xs">{item.nama}</TableCell>
                              <TableCell className="text-xs">{item.kelas}</TableCell>
                              <TableCell className="text-xs">{item.asrama}</TableCell>
                              <TableCell className="text-xs">{item.wali}</TableCell>
                              <TableCell className="text-xs">{item.email}</TableCell>
                            </TableRow>
                          ))}
                          {parsedData.length > 10 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-xs text-center text-muted-foreground">
                                ... dan {parsedData.length - 10} data lainnya
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setParsedData([])
                      setExcelFile(null)
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBulkImport}
                    disabled={isSubmitting || parsedData.length === 0}
                  >
                    {isSubmitting ? "Mengimpor..." : "Import Data"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Santri</DialogTitle>
              <DialogDescription>
                Ubah data santri yang ada di sistem.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nis">NIS</Label>
                  <Input
                    id="edit-nis"
                    name="nis"
                    value={editFormData.nis}
                    onChange={handleEditInputChange}
                    placeholder="Masukkan NIS"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-nama">Nama</Label>
                  <Input
                    id="edit-nama"
                    name="nama"
                    value={editFormData.nama}
                    onChange={handleEditInputChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-kelas">Kelas</Label>
                  <Input
                    id="edit-kelas"
                    name="kelas"
                    value={editFormData.kelas}
                    onChange={handleEditInputChange}
                    placeholder="Masukkan kelas"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-asrama">Nomer Kamar</Label>
                  <Input
                    id="edit-asrama"
                    name="asrama"
                    value={editFormData.asrama}
                    onChange={handleEditInputChange}
                    placeholder="Masukkan nomer kamar"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-wali">Wali</Label>
                  <Input
                    id="edit-wali"
                    name="wali"
                    value={editFormData.wali}
                    onChange={handleEditInputChange}
                    placeholder="Masukkan nama wali"
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">Password (Opsional - isi untuk mengubah)</Label>
                  <Input
                    id="edit-password"
                    name="password"
                    type="password"
                    value={editFormData.password}
                    onChange={handleEditInputChange}
                    placeholder="Masukkan password baru"
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NON_AKTIF">Tidak Aktif</option>
                    <option value="LULUS">Lulus</option>
                    <option value="KELUAR">Keluar</option>
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
          <CardTitle>Daftar Santri</CardTitle>
          <CardDescription>Kelola data santri aktif</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari santri..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Nomer Kamar</TableHead>
                <TableHead>Wali</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSantri.length > 0 ? (
                filteredSantri.map((s) => (
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
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(s)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id)}
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {searchQuery ? "Tidak ada santri yang cocok" : "Belum ada data santri"}
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
