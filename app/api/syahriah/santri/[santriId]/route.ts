import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all Syahriah transactions for a specific santri
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

    // Get all Syahriah transactions for this santri
    const syahriahTransactions = await prisma.transaksi.findMany({
      where: {
        santriId,
        jenis: "SYAHRIAH",
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate statistics
    const totalPaid = syahriahTransactions
      .filter(t => t.status === "LUNAS")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalPending = syahriahTransactions
      .filter(t => t.status === "PENDING")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalUnpaid = syahriahTransactions
      .filter(t => t.status === "BELUM_BAYAR")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const paidCount = syahriahTransactions.filter(t => t.status === "LUNAS").length
    const pendingCount = syahriahTransactions.filter(t => t.status === "PENDING").length
    const unpaidCount = syahriahTransactions.filter(t => t.status === "BELUM_BAYAR").length

    return NextResponse.json({
      santri,
      transactions: syahriahTransactions,
      statistics: {
        totalPaid,
        totalPending,
        totalUnpaid,
        paidCount,
        pendingCount,
        unpaidCount,
        totalTransactions: syahriahTransactions.length,
      },
    })
  } catch (error) {
    console.error("Error fetching santri Syahriah history:", error)
    return NextResponse.json({ error: "Failed to fetch santri Syahriah history" }, { status: 500 })
  }
}
