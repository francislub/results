import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, staffId } = body

    // Validate input
    if (!name || !email || !password || !staffId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Check if staff ID already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        staffId,
      },
    })

    if (existingAdmin) {
      return NextResponse.json({ error: "Staff ID already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
        },
      })

      // Create admin
      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          staffId,
        },
      })

      return { user, admin }
    })

    // Return success without sensitive data
    return NextResponse.json(
      {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering admin:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
