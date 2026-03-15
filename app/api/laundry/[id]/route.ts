import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN"]

// GET single LAUNDRY transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const laundryTransaction = await prisma.transaksi.findUnique({
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

    if (!laundryTransaction) {
      return NextResponse.json({ error: "LAUNDRY transaction not found" }, { status: 404 })
    }

    if (laundryTransaction.jenis !== "LAUNDRY") {
      return NextResponse.json({ error: "Transaction is not a LAUNDRY transaction" }, { status: 400 })
    }

    return NextResponse.json(laundryTransaction)
  } catch (error) {
    console.error("Error fetching LAUNDRY transaction:", error)
    return NextResponse.json({ error: "Failed to fetch LAUNDRY transaction" }, { status: 500 })
  }
}

// DELETE LAUNDRY transaction (cancel transaction)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "LAUNDRY transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "LAUNDRY") {
      return NextResponse.json({ error: "Transaction is not a LAUNDRY transaction" }, { status: 400 })
    }

    // Delete the transaction
    await prisma.transaksi.delete({
      where: { id },
    })

    return NextResponse.json({ message: "LAUNDRY transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting LAUNDRY transaction:", error)
    return NextResponse.json({ error: "Failed to delete LAUNDRY transaction" }, { status: 500 })
  }
}

// PATCH LAUNDRY transaction (update payment status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, tanggalBayar, keterangan } = body

    // Check if transaction exists
    const existingTransaction = await prisma.transaksi.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "LAUNDRY transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "LAUNDRY") {
      return NextResponse.json({ error: "Transaction is not a LAUNDRY transaction" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["LUNAS", "PENDING", "BELUM_BAYAR", "DITOLAK"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid. Gunakan: LUNAS, PENDING, BELUM_BAYAR, atau DITOLAK" },
        { status: 400 }
      )
    }

    // If status is LUNAS, automatically set tanggalBayar if not provided
    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === "LUNAS" && !tanggalBayar) {
        updateData.tanggalBayar = new Date()
      }
    }
    if (tanggalBayar) {
      updateData.tanggalBayar = new Date(tanggalBayar)
    }
    if (keterangan !== undefined) {
      updateData.keterangan = keterangan
    }

    // Update the transaction
    const updatedTransaction = await prisma.transaksi.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating LAUNDRY transaction:", error)
    return NextResponse.json({ error: "Failed to update LAUNDRY transaction" }, { status: 500 })
  }
}
