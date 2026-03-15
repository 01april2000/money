import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin and bendahara SMK access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK"]

// GET single UJIAN transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const ujianTransaction = await prisma.transaksi.findUnique({
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

    if (!ujianTransaction) {
      return NextResponse.json({ error: "UJIAN transaction not found" }, { status: 404 })
    }

    if (ujianTransaction.jenis !== "UJIAN") {
      return NextResponse.json({ error: "Transaction is not an UJIAN transaction" }, { status: 400 })
    }

    return NextResponse.json(ujianTransaction)
  } catch (error) {
    console.error("Error fetching UJIAN transaction:", error)
    return NextResponse.json({ error: "Failed to fetch UJIAN transaction" }, { status: 500 })
  }
}

// PUT update UJIAN transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("PUT /api/ujian/[id] - params:", { id })
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

    console.log("Transaction ID:", id)
    const body = await request.json()
    console.log("Request body:", body)
    const { tahun, jumlah, status, tanggalBayar, keterangan } = body

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "UJIAN transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "UJIAN") {
      return NextResponse.json({ error: "Transaction is not an UJIAN transaction" }, { status: 400 })
    }

    // Check if new year would conflict with existing transaction
    if (tahun && tahun !== existingTransaction.tahun) {
      const conflictingTransaction = await prisma.transaksi.findFirst({
        where: {
          santriId: existingTransaction.santriId,
          jenis: "UJIAN",
          tahun: parseInt(tahun),
          id: { not: id },
        },
      })

      if (conflictingTransaction) {
        return NextResponse.json(
          { error: "UJIAN transaction for this year already exists" },
          { status: 400 }
        )
      }
    }

    // Update UJIAN transaction
    const updatedTransaction = await prisma.transaksi.update({
      where: { id },
      data: {
        ...(tahun && { tahun: parseInt(tahun) }),
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
    console.error("Error updating UJIAN transaction:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error message:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE UJIAN transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("DELETE /api/ujian/[id] - params:", { id })
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

    console.log("Transaction ID:", id)

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "UJIAN transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "UJIAN") {
      return NextResponse.json({ error: "Transaction is not an UJIAN transaction" }, { status: 400 })
    }

    await prisma.transaksi.delete({
      where: { id },
    })

    return NextResponse.json({ message: "UJIAN transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting UJIAN transaction:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error message:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PATCH update UJIAN transaction status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("PATCH /api/ujian/[id] - params:", { id })
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

    console.log("Transaction ID:", id)
    const body = await request.json()
    console.log("Request body:", body)
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 }
      )
    }

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "UJIAN transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "UJIAN") {
      return NextResponse.json({ error: "Transaction is not an UJIAN transaction" }, { status: 400 })
    }

    // Update UJIAN transaction status
    const updatedTransaction = await prisma.transaksi.update({
      where: { id },
      data: {
        status,
        tanggalBayar: status === "LUNAS" ? new Date() : existingTransaction.tanggalBayar,
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
    console.error("Error updating UJIAN transaction status:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error message:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
