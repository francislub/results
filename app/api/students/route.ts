import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, registrationNo, gender, dateOfBirth, parentName, parentContact, classId } = body

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Check if registration number already exists
    const existingStudent = await prisma.student.findUnique({
      where: {
        registrationNo,
      },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Registration number already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      })

      // Create student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          registrationNo,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          parentName,
          parentContact,
          classId,
        },
      })

      return { user, student }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
