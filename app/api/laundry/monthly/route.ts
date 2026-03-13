import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK", "BENDAHARA_SMP", "BENDAHARA_PONDOK"]

// Helper function to get current month and year in Indonesian
function getCurrentMonthYear() {
  const now = new Date()
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]
  return {
    bulan: months[now.getMonth()],
    tahun: now.getFullYear()
  }
}

// GET monthly LAUNDRY report
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const customBulan = searchParams.get("bulan")
    const customTahun = searchParams.get("tahun")
    const asrama = searchParams.get("asrama")
    const kelas = searchParams.get("kelas")
    const status = searchParams.get("status")

    // Use custom month/year if provided, otherwise use current month/year
    const { bulan, tahun } = customBulan && customTahun
      ? { bulan: customBulan, tahun: parseInt(customTahun) }
      : getCurrentMonthYear()

    // Build where clause
    const where: any = {
      jenis: "LAUNDRY",
      bulan,
      tahun,
    }

    if (status) {
      where.status = status
    }

    // Get all laundry transactions for the specified month/year
    const laundryTransactions = await prisma.transaksi.findMany({
      where,
      include: {
        santri: {
          select: {
            id: true,
            nama: true,
            nis: true,
            kelas: true,
            asrama: true,
            wali: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Filter by asrama if provided
    let filteredTransactions = laundryTransactions
    if (asrama) {
      filteredTransactions = filteredTransactions.filter(t => t.santri.asrama === asrama)
    }

    // Filter by kelas if provided
    if (kelas) {
      filteredTransactions = filteredTransactions.filter(t => t.santri.kelas === kelas)
    }

    // Calculate statistics
    const totalTransactions = filteredTransactions.length
    const totalPaid = filteredTransactions
      .filter(t => t.status === "LUNAS")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalUnpaid = filteredTransactions
      .filter(t => t.status === "BELUM_BAYAR")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const paidCount = filteredTransactions.filter(t => t.status === "LUNAS").length
    const unpaidCount = filteredTransactions.filter(t => t.status === "BELUM_BAYAR").length
    const pendingCount = filteredTransactions.filter(t => t.status === "PENDING").length

    // Group by asrama
    const asramaStats: Record<string, any> = {}
    filteredTransactions.forEach(t => {
      const asramaName = t.santri.asrama
      if (!asramaStats[asramaName]) {
        asramaStats[asramaName] = {
          asrama: asramaName,
          total: 0,
          paid: 0,
          unpaid: 0,
          count: 0,
        }
      }
      asramaStats[asramaName].total += t.jumlah
      asramaStats[asramaName].count += 1
      if (t.status === "LUNAS") {
        asramaStats[asramaName].paid += t.jumlah
      } else {
        asramaStats[asramaName].unpaid += t.jumlah
      }
    })

    // Group by kelas
    const kelasStats: Record<string, any> = {}
    filteredTransactions.forEach(t => {
      const kelasName = t.santri.kelas
      if (!kelasStats[kelasName]) {
        kelasStats[kelasName] = {
          kelas: kelasName,
          total: 0,
          paid: 0,
          unpaid: 0,
          count: 0,
        }
      }
      kelasStats[kelasName].total += t.jumlah
      kelasStats[kelasName].count += 1
      if (t.status === "LUNAS") {
        kelasStats[kelasName].paid += t.jumlah
      } else {
        kelasStats[kelasName].unpaid += t.jumlah
      }
    })

    return NextResponse.json({
      bulan,
      tahun,
      transactions: filteredTransactions,
      summary: {
        totalTransactions,
        totalPaid,
        totalUnpaid,
        paidCount,
        unpaidCount,
        pendingCount,
        grandTotal: totalPaid + totalUnpaid,
      },
      byAsrama: Object.values(asramaStats),
      byKelas: Object.values(kelasStats),
    })
  } catch (error) {
    console.error("Error fetching monthly LAUNDRY report:", error)
    return NextResponse.json({ error: "Failed to fetch monthly LAUNDRY report" }, { status: 500 })
  }
}
