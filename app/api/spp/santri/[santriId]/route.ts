import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN"]

// GET all SPP transactions for a specific santri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ santriId: string }> }
) {
  try {
    const { santriId } = await params

    // Check if santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: santriId },
      select: {
        id: true,
        nama: true,
        nis: true,
        kelas: true,
        asrama: true,
        wali: true,
      },
    })

    if (!santri) {
      return NextResponse.json({ error: "Santri not found" }, { status: 404 })
    }

    // Get all SPP transactions for this santri
    const sppTransactions = await prisma.transaksi.findMany({
      where: {
        santriId,
        jenis: "SPP",
      },
      include: {
        midtransTransactions: {
          where: {
            transactionStatus: {
              in: ["pending", "authorize", "settlement", "capture"],
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate statistics
    const totalPaid = sppTransactions
      .filter(t => t.status === "LUNAS")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalPending = sppTransactions
      .filter(t => t.status === "PENDING")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalUnpaid = sppTransactions
      .filter(t => t.status === "BELUM_BAYAR")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const paidCount = sppTransactions.filter(t => t.status === "LUNAS").length
    const pendingCount = sppTransactions.filter(t => t.status === "PENDING").length
    const unpaidCount = sppTransactions.filter(t => t.status === "BELUM_BAYAR").length

    return NextResponse.json({
      santri,
      transactions: sppTransactions,
      statistics: {
        totalPaid,
        totalPending,
        totalUnpaid,
        paidCount,
        pendingCount,
        unpaidCount,
        totalTransactions: sppTransactions.length,
      },
    })
  } catch (error) {
    console.error("Error fetching santri SPP history:", error)
    return NextResponse.json({ error: "Failed to fetch santri SPP history" }, { status: 500 })
  }
}
