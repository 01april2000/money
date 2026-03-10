import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// Define allowed roles for admin access
const ADMIN_ROLES = ["ADMIN", "BENDAHARA_SMK", "BENDAHARA_SMP", "BENDAHARA_PONDOK"]

// GET single UANG_SAKU transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const uangSakuTransaction = await prisma.transaksi.findUnique({
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

    if (!uangSakuTransaction) {
      return NextResponse.json({ error: "UANG_SAKU transaction not found" }, { status: 404 })
    }

    if (uangSakuTransaction.jenis !== "UANG_SAKU") {
      return NextResponse.json({ error: "Transaction is not an UANG_SAKU transaction" }, { status: 400 })
    }

    return NextResponse.json(uangSakuTransaction)
  } catch (error) {
    console.error("Error fetching UANG_SAKU transaction:", error)
    return NextResponse.json({ error: "Failed to fetch UANG_SAKU transaction" }, { status: 500 })
  }
}

// DELETE UANG_SAKU transaction (cancel transaction)
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
      return NextResponse.json({ error: "UANG_SAKU transaction not found" }, { status: 404 })
    }

    if (existingTransaction.jenis !== "UANG_SAKU") {
      return NextResponse.json({ error: "Transaction is not an UANG_SAKU transaction" }, { status: 400 })
    }

    // Delete the transaction
    await prisma.transaksi.delete({
      where: { id },
    })

    return NextResponse.json({ message: "UANG_SAKU transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting UANG_SAKU transaction:", error)
    return NextResponse.json({ error: "Failed to delete UANG_SAKU transaction" }, { status: 500 })
  }
}
