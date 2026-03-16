import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { createSnapTransaction, formatAmount } from "@/lib/midtrans"

export async function POST(request: NextRequest) {
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

    const userRole = (session.user as any)?.role
    if (userRole !== "SANTRI") {
      return NextResponse.json(
        { error: "Forbidden - Only santri can create payments" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { transaksiId } = body

    if (!transaksiId) {
      return NextResponse.json(
        { error: "transaksiId is required" },
        { status: 400 }
      )
    }

    // Get santri ID from session
    const santriId = (session.user as any)?.santriId
    if (!santriId) {
      return NextResponse.json(
        { error: "Santri not found" },
        { status: 404 }
      )
    }

    // Find the transaction
    const transaction = await prisma.transaksi.findUnique({
      where: { id: transaksiId },
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

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Verify transaction belongs to the santri
    if (transaction.santriId !== santriId) {
      return NextResponse.json(
        { error: "Forbidden - Transaction does not belong to you" },
        { status: 403 }
      )
    }

    // Check if transaction is already paid
    if (transaction.status === "LUNAS") {
      return NextResponse.json(
        { error: "Transaction is already paid" },
        { status: 400 }
      )
    }

    // Check if there's already a pending Midtrans transaction
    const existingMidtransTx = await prisma.midtransTransaction.findFirst({
      where: {
        transaksiId,
        transactionStatus: {
          in: ["pending", "authorize"],
        },
      },
    })

    if (existingMidtransTx) {
      // Return existing snap token if transaction is still pending
      const response = await createSnapTransaction({
        orderId: existingMidtransTx.orderId,
        grossAmount: transaction.jumlah,
        customerDetails: {
          firstName: transaction.santri.nama.split(" ")[0],
          lastName: transaction.santri.nama.split(" ").slice(1).join(" ") || undefined,
          email: session.user.email || `${transaction.santri.nis}@santri.ponpes.id`,
          phone: undefined,
        },
        itemDetails: [
          {
            id: transaction.id,
            price: transaction.jumlah,
            quantity: 1,
            name: `${transaction.jenis} - ${transaction.bulan || ""} ${transaction.tahun || ""}`.trim(),
          },
        ],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/santri/${transaction.jenis.toLowerCase()}`,
          unfinish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/santri/${transaction.jenis.toLowerCase()}`,
          error: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/santri/${transaction.jenis.toLowerCase()}`,
        },
      })

      return NextResponse.json({
        snapToken: response.token,
        orderId: existingMidtransTx.orderId,
        redirectUrl: response.redirect_url,
      })
    }

    // Generate unique order ID
    const orderId = `${transaction.jenis}-${transaction.id}-${Date.now()}`

    // Create Snap transaction
    const response = await createSnapTransaction({
      orderId,
      grossAmount: transaction.jumlah,
      customerDetails: {
        firstName: transaction.santri.nama.split(" ")[0],
        lastName: transaction.santri.nama.split(" ").slice(1).join(" ") || undefined,
        email: session.user.email || `${transaction.santri.nis}@santri.ponpes.id`,
        phone: undefined,
      },
      itemDetails: [
        {
          id: transaction.id,
          price: transaction.jumlah,
          quantity: 1,
          name: `${transaction.jenis} - ${transaction.bulan || ""} ${transaction.tahun || ""}`.trim(),
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/santri/${transaction.jenis.toLowerCase()}`,
        unfinish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/santri/${transaction.jenis.toLowerCase()}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/santri/${transaction.jenis.toLowerCase()}`,
      },
    })

    // Save Midtrans transaction to database
    await prisma.midtransTransaction.create({
      data: {
        orderId,
        transaksiId,
        grossAmount: transaction.jumlah,
        transactionStatus: "pending",
      },
    })

    // Update transaction status to PENDING
    await prisma.transaksi.update({
      where: { id: transaksiId },
      data: { status: "PENDING" },
    })

    return NextResponse.json({
      snapToken: response.token,
      orderId,
      redirectUrl: response.redirect_url,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
