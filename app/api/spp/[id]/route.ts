import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK", "BENDAHARA_SMP", "BENDAHARA_PONDOK"]

// GET single SPP transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sppTransaction = await prisma.transaksi.findUnique({
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

    if (!sppTransaction) {
      return NextResponse.json({ error: "SPP transaction not found" }, { status: 404 })
    }

    if (sppTransaction.jenis !== "SPP") {
      return NextResponse.json({ error: "Transaction is not an SPP transaction" }, { status: 400 })
    }

    return NextResponse.json(sppTransaction)
  } catch (error) {
    console.error("Error fetching SPP transaction:", error)
    return NextResponse.json({ error: "Failed to fetch SPP transaction" }, { status: 500 })
  }
}

// PUT update SPP transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("PUT /api/spp/[id] - params:", params)
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
    console.log("User role:", userRole, "Admin roles:", ADMIN_ROLES)
    if (!ADMIN_ROLES.includes(userRole)) {
      console.log("Forbidden - insufficient permissions")
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params
    console.log("Transaction ID:", id)
    const body = await request.json()
    console.log("Request body:", body)
    const { bulan, jumlah, status, tanggalBayar, keterangan } = body

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "SPP transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "SPP") {
      return NextResponse.json({ error: "Transaction is not an SPP transaction" }, { status: 400 })
    }

    // Check if new month would conflict with existing transaction
    if (bulan && bulan !== existingTransaction.bulan) {
      const conflictingTransaction = await prisma.transaksi.findFirst({
        where: {
          santriId: existingTransaction.santriId,
          jenis: "SPP",
          bulan,
          id: { not: id },
        },
      })

      if (conflictingTransaction) {
        return NextResponse.json(
          { error: "SPP transaction for this month already exists" },
          { status: 400 }
        )
      }
    }

    // Update SPP transaction
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
    console.error("Error updating SPP transaction:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error message:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE SPP transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("DELETE /api/spp/[id] - params:", params)
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
    console.log("User role:", userRole, "Admin roles:", ADMIN_ROLES)
    if (!ADMIN_ROLES.includes(userRole)) {
      console.log("Forbidden - insufficient permissions")
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params
    console.log("Transaction ID:", id)

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "SPP transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "SPP") {
      return NextResponse.json({ error: "Transaction is not an SPP transaction" }, { status: 400 })
    }

    await prisma.transaksi.delete({
      where: { id },
    })

    return NextResponse.json({ message: "SPP transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting SPP transaction:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error message:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
