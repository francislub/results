import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Admin can view any admin
    // Others can only view themselves
    if (session.user.role !== "ADMIN" && session.user.adminId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Error fetching admin:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Only the admin themselves can update their profile
    if (session.user.adminId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, staffId } = body

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Update user and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: {
          id: admin.userId,
        },
        data: {
          name,
          email,
        },
      })

      // Update admin
      const updatedAdmin = await tx.admin.update({
        where: {
          id,
        },
        data: {
          staffId,
        },
      })

      return { user, admin: updatedAdmin }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating admin:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
