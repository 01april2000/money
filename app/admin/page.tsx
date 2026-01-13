import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK", "BENDAHARA_SMP", "BENDAHARA_PONDOK"]

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to format date
function formatDate(date: Date | null): string {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

// Helper function to get status badge color
function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "LUNAS":
      return "bg-green-100 text-green-700"
    case "PENDING":
      return "bg-yellow-100 text-yellow-700"
    case "BELUM_BAYAR":
      return "bg-red-100 text-red-700"
    case "DITOLAK":
      return "bg-red-100 text-red-700"
    case "AKTIF":
      return "bg-green-100 text-green-700"
    case "NON_AKTIF":
      return "bg-gray-100 text-gray-700"
    case "LULUS":
      return "bg-blue-100 text-blue-700"
    case "KELUAR":
      return "bg-orange-100 text-orange-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

// Fetch dashboard statistics
async function getDashboardStats() {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Count total santri
  const totalSantri = await prisma.santri.count({
    where: { status: "AKTIF" }
  })

  // Calculate income this month
  const transactionsThisMonth = await prisma.transaksi.findMany({
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  })

  const incomeThisMonth = transactionsThisMonth.reduce((sum, trx) => sum + trx.jumlah, 0)

  // Calculate expenses (for now, we'll use a placeholder or derive from transactions)
  // In a real app, you'd have a separate expenses table
  const expensesThisMonth = 0 // Placeholder - update when expenses model is added

  // Count pending transactions
  const pendingTransactions = await prisma.transaksi.count({
    where: { status: "PENDING" }
  })

  return {
    totalSantri,
    incomeThisMonth,
    expensesThisMonth,
    pendingTransactions,
  }
}

// Fetch recent transactions
async function getRecentTransactions() {
  return await prisma.transaksi.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      santri: {
        select: {
          nama: true,
        },
      },
    },
  })
}

// Fetch all users
async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })
}

// Fetch all santri
async function getSantri() {
  return await prisma.santri.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })
}

// Fetch transactions by type
async function getTransactionsByType(jenis: string) {
  return await prisma.transaksi.findMany({
    where: { jenis: jenis as any },
    orderBy: { createdAt: "desc" },
    include: {
      santri: {
        select: {
          nama: true,
        },
      },
    },
  })
}

// Fetch financial summary
async function getFinancialSummary() {
  const now = new Date()
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

  // Total income this year
  const incomeTransactions = await prisma.transaksi.findMany({
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfYear,
      },
    },
  })

  const totalIncome = incomeTransactions.reduce((sum, trx) => sum + trx.jumlah, 0)

  // Total expenses (placeholder)
  const totalExpenses = 0 // Placeholder - update when expenses model is added

  // Get monthly breakdown
  const monthlyData = await prisma.transaksi.groupBy({
    by: ["createdAt"],
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfYear,
      },
    },
    _sum: {
      jumlah: true,
    },
  })

  // Group by month
  const monthlyIncome: Record<string, number> = {}
  monthlyData.forEach((item) => {
    const monthKey = item.createdAt.toISOString().slice(0, 7) // YYYY-MM
    monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + (item._sum.jumlah || 0)
  })

  // Get breakdown by transaction type
  const typeData = await prisma.transaksi.groupBy({
    by: ["jenis"],
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfYear,
      },
    },
    _count: true,
    _sum: {
      jumlah: true,
    },
  })

  const transactionByType = typeData.map((item) => ({
    jenis: item.jenis,
    count: item._count,
    total: item._sum.jumlah || 0,
  }))

  return {
    totalIncome,
    totalExpenses,
    monthlyIncome,
    transactionByType,
  }
}

export default async function AdminPage() {
  // Get session on server side
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Check if user is logged in
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Akses Ditolak
            </CardTitle>
            <CardDescription>
              Anda harus login terlebih dahulu untuk mengakses halaman ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth" className="w-full">
              <Button className="w-full">
                Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user has admin role
  const userRole = (session.user as any)?.role
  const hasAdminAccess = ADMIN_ROLES.includes(userRole)

  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Akses Ditolak
            </CardTitle>
            <CardDescription>
              Anda tidak memiliki izin untuk mengakses halaman admin. Role Anda: {userRole}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="w-full">
              <Button className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch all data in parallel
  const [
    stats,
    recentTransactions,
    users,
    santri,
    sppTransactions,
    syahriahTransactions,
    uangSakuTransactions,
    laundryTransactions,
    financialSummary,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentTransactions(),
    getUsers(),
    getSantri(),
    getTransactionsByType("SPP"),
    getTransactionsByType("SYAHRIAH"),
    getTransactionsByType("UANG_SAKU"),
    getTransactionsByType("LAUNDRY"),
    getFinancialSummary(),
  ])

  // Prepare data to pass to client components
  const dashboardData = {
    stats,
    recentTransactions: recentTransactions.map((trx) => ({
      id: trx.kode,
      namaSantri: trx.santri.nama,
      jenis: trx.jenis,
      jumlah: formatCurrency(trx.jumlah),
      status: trx.status,
      tanggal: formatDate(trx.tanggalBayar || trx.createdAt),
    })),
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.emailVerified ? "Aktif" : "Tidak Aktif",
    })),
    santri: santri.map((s) => ({
      id: s.id,
      nis: s.nis,
      nama: s.nama,
      kelas: s.kelas,
      asrama: s.asrama,
      wali: s.wali,
      status: s.status,
      email: s.user?.email || "",
    })),
    sppTransactions: sppTransactions.map((trx) => ({
      id: trx.kode,
      namaSantri: trx.santri.nama,
      bulan: trx.bulan || "-",
      jumlah: formatCurrency(trx.jumlah),
      tanggalBayar: formatDate(trx.tanggalBayar),
      status: trx.status,
    })),
    syahriahTransactions: syahriahTransactions.map((trx) => ({
      id: trx.kode,
      namaSantri: trx.santri.nama,
      bulan: trx.bulan || "-",
      jumlah: formatCurrency(trx.jumlah),
      tanggalBayar: formatDate(trx.tanggalBayar),
      status: trx.status,
    })),
    uangSakuTransactions: uangSakuTransactions.map((trx) => ({
      id: trx.kode,
      namaSantri: trx.santri.nama,
      jumlah: formatCurrency(trx.jumlah),
      tanggal: formatDate(trx.tanggalBayar || trx.createdAt),
      status: trx.status,
    })),
    laundryTransactions: laundryTransactions.map((trx) => ({
      id: trx.kode,
      namaSantri: trx.santri.nama,
      jenisLaundry: trx.jenisLaundry || "-",
      jumlah: formatCurrency(trx.jumlah),
      tanggal: formatDate(trx.tanggalBayar || trx.createdAt),
      status: trx.status,
    })),
    financialSummary: {
      totalIncome: formatCurrency(financialSummary.totalIncome),
      totalExpenses: formatCurrency(financialSummary.totalExpenses),
      balance: formatCurrency(financialSummary.totalIncome - financialSummary.totalExpenses),
      monthlyIncome: Object.entries(financialSummary.monthlyIncome).map(([month, amount]) => ({
        month,
        income: formatCurrency(amount),
        expenses: "Rp 0", // Placeholder
        balance: formatCurrency(amount),
      })),
      transactionByType: financialSummary.transactionByType.map((item) => ({
        jenis: item.jenis,
        count: item.count,
        total: formatCurrency(item.total),
      })),
    },
  }

  // Render admin dashboard with real data
  return <DashboardLayout dashboardData={dashboardData} session={session} />
}
