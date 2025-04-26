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

    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
        classTeacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(teachers)
  } catch (error) {
    console.error("Error fetching teachers:", error)
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
    const { name, email, password, staffId, qualification, gender, dateOfBirth, address, contact, subjects } = body

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
    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        staffId,
      },
    })

    if (existingTeacher) {
      return NextResponse.json({ error: "Staff ID already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and teacher in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "TEACHER",
        },
      })

      // Create teacher
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          staffId,
          qualification,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          contact,
        },
      })

      // Assign subjects if provided
      if (subjects && subjects.length > 0) {
        for (const subjectId of subjects) {
          await tx.subjectTeacher.create({
            data: {
              teacherId: teacher.id,
              subjectId,
            },
          })
        }
      }

      return { user, teacher }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating teacher:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
