import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma, JenisTransaksi } from "@/lib/prisma"
import { DashboardLayout } from "@/components/bendahara-smk/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

// Define allowed roles for Bendahara SMK access
const BENDAHARA_SMK_ROLES = ["ADMIN", "BENDAHARA_SMK"]

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
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "BELUM_BAYAR":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "DITOLAK":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "DITAMBAH":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "DIAMBIL":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
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

// Fetch dashboard statistics for SMK
async function getDashboardStats() {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Count total SMK santri
  const totalSantri = await prisma.santri.count({
    where: {
      status: "AKTIF",
      jenisSantri: "SMK"
    }
  })

  // Calculate income this month for SMK
  const transactionsThisMonth = await prisma.transaksi.findMany({
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfMonth,
      },
      santri: {
        jenisSantri: "SMK"
      }
    },
    include: {
      santri: {
        select: {
          kelas: true
        }
      }
    }
  })

  const incomeThisMonth = transactionsThisMonth.reduce((sum, trx) => sum + trx.jumlah, 0)

  // Count pending transactions for SMK
  const pendingTransactions = await prisma.transaksi.count({
    where: {
      status: "PENDING",
      santri: {
        jenisSantri: "SMK"
      }
    }
  })

  // Count unpaid transactions for SMK
  const unpaidTransactions = await prisma.transaksi.count({
    where: {
      status: "BELUM_BAYAR",
      santri: {
        jenisSantri: "SMK"
      }
    }
  })

  return {
    totalSantri,
    incomeThisMonth,
    pendingTransactions,
    unpaidTransactions,
  }
}

// Fetch recent transactions for SMK
async function getRecentTransactions() {
  return await prisma.transaksi.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    where: {
      santri: {
        jenisSantri: "SMK"
      }
    },
    include: {
      santri: {
        select: {
          nama: true,
          nis: true,
          kelas: true,
        },
      },
    },
  })
}

// Fetch SMK santri
async function getSantri() {
  return await prisma.santri.findMany({
    where: {
      jenisSantri: "SMK"
    },
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

// Fetch transactions by type for SMK
async function getTransactionsByType(jenis: JenisTransaksi) {
  return await prisma.transaksi.findMany({
    where: {
      jenis,
      santri: {
        jenisSantri: "SMK"
      },
      // Filter by managedBy for Syahriah transactions
      ...(jenis === "SYAHRIAH" ? { managedBy: "BENDAHARA_SMK" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      santri: {
        select: {
          nama: true,
          nis: true,
          kelas: true,
          asrama: true,
        },
      },
    },
  })
}

// Fetch financial summary for SMK
async function getFinancialSummary() {
  const now = new Date()
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

  // Total income this year for SMK
  const incomeTransactions = await prisma.transaksi.findMany({
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfYear,
      },
      santri: {
        jenisSantri: "SMK"
      }
    },
  })

  const totalIncome = incomeTransactions.reduce((sum, trx) => sum + trx.jumlah, 0)

  // Get monthly breakdown for SMK
  const monthlyData = await prisma.transaksi.groupBy({
    by: ["createdAt"],
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfYear,
      },
      santri: {
        jenisSantri: "SMK"
      }
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

  // Get breakdown by transaction type for SMK
  const typeData = await prisma.transaksi.groupBy({
    by: ["jenis"],
    where: {
      status: "LUNAS",
      createdAt: {
        gte: firstDayOfYear,
      },
      santri: {
        jenisSantri: "SMK"
      }
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
    monthlyIncome,
    transactionByType,
  }
}

export default async function BendaharaSmkPage() {
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

  // Check if user has Bendahara SMK role
  const userRole = (session.user as any)?.role
  const hasAccess = BENDAHARA_SMK_ROLES.includes(userRole)

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Akses Ditolak
            </CardTitle>
            <CardDescription>
              Anda tidak memiliki izin untuk mengakses halaman Bendahara SMK. Role Anda: {userRole}
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
    santri,
    sppTransactions,
    syahriahTransactions,
    ujianTransactions,
    financialSummary,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentTransactions(),
    getSantri(),
    getTransactionsByType(JenisTransaksi.SPP),
    getTransactionsByType(JenisTransaksi.SYAHRIAH),
    getTransactionsByType(JenisTransaksi.UJIAN),
    getFinancialSummary(),
  ])

  // Format data for the dashboard
  const dashboardData = {
    stats: {
      totalSantri: stats.totalSantri,
      incomeThisMonth: stats.incomeThisMonth,
      pendingTransactions: stats.pendingTransactions,
      unpaidTransactions: stats.unpaidTransactions,
    },
    recentTransactions: recentTransactions.map((trx) => ({
      id: trx.id,
      namaSantri: trx.santri.nama,
      jenis: trx.jenis,
      jumlah: formatCurrency(trx.jumlah),
      status: trx.status,
      tanggal: formatDate(trx.createdAt),
      kode: trx.kode,
      nis: trx.santri.nis,
      kelas: trx.santri.kelas,
    })),
    santri: santri.map((s) => ({
      id: s.id,
      nis: s.nis,
      nama: s.nama,
      kelas: s.kelas,
      asrama: s.asrama,
      wali: s.wali,
      status: s.status,
      email: s.user?.email || "-",
      beasiswa: s.beasiswa,
      jenisBeasiswa: s.jenisBeasiswa,
      jenisSantri: s.jenisSantri,
    })),
    sppTransactions: sppTransactions.map((trx) => ({
      id: trx.id,
      kode: trx.kode,
      namaSantri: trx.santri.nama,
      nis: trx.santri.nis,
      kelas: trx.santri.kelas,
      asrama: trx.santri.asrama,
      bulan: trx.bulan,
      periodePembayaran: trx.periodePembayaran,
      tahun: trx.tahun?.toString() || "-",
      jumlah: formatCurrency(trx.jumlah),
      tanggalBayar: formatDate(trx.tanggalBayar),
      keterangan: trx.keterangan || "-",
      createdAt: formatDate(trx.createdAt),
      status: trx.status,
      _raw: trx,
    })),
    syahriahTransactions: syahriahTransactions.map((trx) => ({
      id: trx.id,
      kode: trx.kode,
      namaSantri: trx.santri.nama,
      nis: trx.santri.nis,
      kelas: trx.santri.kelas,
      asrama: trx.santri.asrama,
      bulan: trx.bulan,
      periodePembayaran: trx.periodePembayaran,
      tahun: trx.tahun?.toString() || "-",
      jumlah: formatCurrency(trx.jumlah),
      tanggalBayar: formatDate(trx.tanggalBayar),
      keterangan: trx.keterangan || "-",
      createdAt: formatDate(trx.createdAt),
      status: trx.status,
      _raw: trx,
    })),
    ujianTransactions: ujianTransactions.map((trx) => ({
      id: trx.id,
      kode: trx.kode,
      namaSantri: trx.santri.nama,
      nis: trx.santri.nis,
      kelas: trx.santri.kelas,
      asrama: trx.santri.asrama,
      tahun: trx.tahun?.toString() || "-",
      jumlah: formatCurrency(trx.jumlah),
      tanggalBayar: formatDate(trx.tanggalBayar),
      keterangan: trx.keterangan || "-",
      createdAt: formatDate(trx.createdAt),
      status: trx.status,
      _raw: trx,
    })),
    financialSummary: {
      totalIncome: formatCurrency(financialSummary.totalIncome),
      monthlyIncome: financialSummary.monthlyIncome,
      transactionByType: financialSummary.transactionByType.map((item) => ({
        jenis: item.jenis,
        count: item.count,
        total: formatCurrency(item.total),
      })),
    },
  }

  return (
    <DashboardLayout dashboardData={dashboardData} session={session} />
  )
}
