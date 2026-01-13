import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all santri
export async function GET() {
  try {
    const santri = await prisma.santri.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(santri)
  } catch (error) {
    console.error("Error fetching santri:", error)
    return NextResponse.json({ error: "Failed to fetch santri" }, { status: 500 })
  }
}

// POST create new santri (single or bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bulk, santri: santriData } = body

    // Bulk import
    if (bulk && Array.isArray(santriData)) {
      const results = []
      const errors = []

      for (const item of santriData) {
        const { nis, nama, kelas, asrama, wali, status, email, password } = item

        // Validate required fields
        if (!nis || !nama || !kelas || !asrama || !wali) {
          errors.push({ nis, error: "Missing required fields" })
          continue
        }

        // Check if NIS already exists
        const existingSantri = await prisma.santri.findUnique({
          where: { nis },
        })

        if (existingSantri) {
          errors.push({ nis, error: "NIS already exists" })
          continue
        }

        // Create new user with SANTRI role
        if (!email || !password) {
          errors.push({ nis, error: "Email and password are required" })
          continue
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          errors.push({ nis, error: "Email already exists" })
          continue
        }

        try {
          // Create user first with account
          const user = await prisma.user.create({
            data: {
              id: crypto.randomUUID(),
              name: nama,
              email,
              role: "SANTRI",
              emailVerified: false,
              accounts: {
                create: {
                  id: crypto.randomUUID(),
                  accountId: email,
                  providerId: "credential",
                  password: password,
                },
              },
            },
          })

          // Then create santri
          const santriId = crypto.randomUUID()
          const santri = await prisma.santri.create({
            data: {
              id: santriId,
              nis,
              nama,
              kelas,
              asrama,
              wali,
              status: status || "AKTIF",
            },
          })

          // Update user to set santriId
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { santriId: santri.id },
          })
    
          results.push(santri)
        } catch (err) {
          errors.push({ nis, error: err instanceof Error ? err.message : "Failed to create santri" })
        }
      }

      return NextResponse.json({
        success: results.length,
        failed: errors.length,
        results,
        errors,
      }, { status: 201 })
    }

    // Single santri creation
    const { nis, nama, kelas, asrama, wali, status, userId, email, password } = body

    // Validate required fields
    if (!nis || !nama || !kelas || !asrama || !wali) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if NIS already exists
    const existingSantri = await prisma.santri.findUnique({
      where: { nis },
    })

    if (existingSantri) {
      return NextResponse.json({ error: "NIS already exists" }, { status: 400 })
    }

    let finalUserId = userId

    // If userId is not provided, create a new user
    if (!finalUserId) {
      if (!email || !password) {
        return NextResponse.json({
          error: "Email and password are required when userId is not provided"
        }, { status: 400 })
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }

      // Create user first with account
      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: nama,
          email,
          role: "SANTRI",
          emailVerified: false,
          accounts: {
            create: {
              id: crypto.randomUUID(),
              accountId: email,
              providerId: "credential",
              password: password,
            },
          },
        },
      })
      
      // Then create santri
      const santriId = crypto.randomUUID()
      const santri = await prisma.santri.create({
        data: {
          id: santriId,
          nis,
          nama,
          kelas,
          asrama,
          wali,
          status: status || "AKTIF",
        },
      })

      // Update user to set santriId
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { santriId: santri.id },
      })

      return NextResponse.json(santri, { status: 201 })
    }

    const santri = await prisma.santri.create({
      data: {
        nis,
        nama,
        kelas,
        asrama,
        wali,
        status: status || "AKTIF",
        user: {
          connect: { id: finalUserId },
        },
      },
    })

    return NextResponse.json(santri, { status: 201 })
  } catch (error) {
    console.error("Error creating santri:", error)
    return NextResponse.json({ error: "Failed to create santri" }, { status: 500 })
  }
}

// PUT update santri
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing santri id" }, { status: 400 })
    }

    const body = await request.json()
    const { nis, nama, kelas, asrama, wali, status, email, password } = body

    // Check if santri exists
    const existingSantri = await prisma.santri.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingSantri) {
      return NextResponse.json({ error: "Santri not found" }, { status: 404 })
    }

    // Check if new NIS already exists (if NIS is being changed)
    if (nis && nis !== existingSantri.nis) {
      const duplicateNIS = await prisma.santri.findUnique({
        where: { nis },
      })
      if (duplicateNIS) {
        return NextResponse.json({ error: "NIS already exists" }, { status: 400 })
      }
    }

    // Update user if email is provided
    if (email && existingSantri.user && email !== existingSantri.user.email) {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: existingSantri.user.id },
        data: { email },
      })
    }

    // Update password if provided
    if (password && existingSantri.user) {
      await prisma.account.updateMany({
        where: { userId: existingSantri.user.id },
        data: { password },
      })
    }

    // Update santri
    const santri = await prisma.santri.update({
      where: { id },
      data: {
        ...(nis && { nis }),
        ...(nama && { nama }),
        ...(kelas && { kelas }),
        ...(asrama && { asrama }),
        ...(wali && { wali }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(santri)
  } catch (error) {
    console.error("Error updating santri:", error)
    return NextResponse.json({ error: "Failed to update santri" }, { status: 500 })
  }
}

// DELETE santri
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing santri id" }, { status: 400 })
    }

    // Check if santri exists
    const existingSantri = await prisma.santri.findUnique({
      where: { id },
    })

    if (!existingSantri) {
      return NextResponse.json({ error: "Santri not found" }, { status: 404 })
    }

    await prisma.santri.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Santri deleted successfully" })
  } catch (error) {
    console.error("Error deleting santri:", error)
    return NextResponse.json({ error: "Failed to delete santri" }, { status: 500 })
  }
}
