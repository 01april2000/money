import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for bendahara-smk access
const BENDAHARA_SMK_ROLES = ["ADMIN", "BENDAHARA_SMK"]

// GET single Syahriah transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const syahriahTransaction = await prisma.transaksi.findUnique({
      where: { id },
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
    })

    if (!syahriahTransaction) {
      return NextResponse.json({ error: "Syahriah transaction not found" }, { status: 404 })
    }

    if (syahriahTransaction.jenis !== "SYAHRIAH") {
      return NextResponse.json({ error: "Transaction is not a Syahriah transaction" }, { status: 400 })
    }

    if (syahriahTransaction.managedBy !== "BENDAHARA_SMK") {
      return NextResponse.json({ error: "Transaction is not managed by Bendahara SMK" }, { status: 400 })
    }

    return NextResponse.json(syahriahTransaction)
  } catch (error) {
    console.error("Error fetching Syahriah transaction:", error)
    return NextResponse.json({ error: "Failed to fetch Syahriah transaction" }, { status: 500 })
  }
}

// PUT update Syahriah transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("PUT /api/bendahara-smk/syahriah/[id] - params:", { id })
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      console.log("Unauthorized - no session")
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    console.log("User role:", userRole, "Bendahara SMK roles:", BENDAHARA_SMK_ROLES)
    if (!BENDAHARA_SMK_ROLES.includes(userRole)) {
      console.log("Forbidden - insufficient permissions")
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    console.log("Transaction ID:", id)
    const body = await request.json()
    console.log("Request body:", body)
    const { bulan, jumlah, status, tanggalBayar, keterangan } = body

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Syahriah transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "SYAHRIAH") {
      return NextResponse.json({ error: "Transaction is not a Syahriah transaction" }, { status: 400 })
    }

    if (existingTransaction.managedBy !== "BENDAHARA_SMK") {
      return NextResponse.json({ error: "Transaction is not managed by Bendahara SMK" }, { status: 400 })
    }

    // Check if new month would conflict with existing transaction
    if (bulan && bulan !== existingTransaction.bulan) {
      const conflictingTransaction = await prisma.transaksi.findFirst({
        where: {
          santriId: existingTransaction.santriId,
          jenis: "SYAHRIAH",
          bulan,
          managedBy: "BENDAHARA_SMK",
          id: { not: id },
        },
      })

      if (conflictingTransaction) {
        return NextResponse.json(
          { error: "Syahriah transaction for this month already exists" },
          { status: 400 }
        )
      }
    }

    // Update Syahriah transaction
    const updatedTransaction = await prisma.transaksi.update({
      where: { id },
      data: {
        ...(bulan && { bulan }),
        ...(jumlah && { jumlah: parseInt(jumlah) }),
        ...(status && { status }),
        ...(tanggalBayar !== undefined && { tanggalBayar: tanggalBayar ? new Date(tanggalBayar) : null }),
        ...(keterangan !== undefined && { keterangan }),
      },
      include: {
        santri: {
          select: {
            id: true,
            nama: true,
            nis: true,
            kelas: true,
            asrama: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error updating Syahriah transaction:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error message:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE Syahriah transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("DELETE /api/bendahara-smk/syahriah/[id] - params:", { id })
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      console.log("Unauthorized - no session")
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    console.log("User role:", userRole, "Bendahara SMK roles:", BENDAHARA_SMK_ROLES)
    if (!BENDAHARA_SMK_ROLES.includes(userRole)) {
      console.log("Forbidden - insufficient permissions")
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    console.log("Transaction ID:", id)

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Syahriah transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "SYAHRIAH") {
      return NextResponse.json({ error: "Transaction is not a Syahriah transaction" }, { status: 400 })
    }

    if (existingTransaction.managedBy !== "BENDAHARA_SMK") {
      return NextResponse.json({ error: "Transaction is not managed by Bendahara SMK" }, { status: 400 })
    }

    await prisma.transaksi.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Syahriah transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting Syahriah transaction:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error message:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
