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

    // Admin can view any student
    // Teachers can view students in their classes
    // Students can only view themselves
    if (session.user.role === "STUDENT" && session.user.studentId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: {
        id,
      },
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
            level: true,
            academicYear: true,
            term: true,
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        marks: {
          include: {
            subject: true,
            exam: true,
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    const { name, email, registrationNo, gender, dateOfBirth, parentName, parentContact, classId } = body

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Update user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: {
          id: student.userId,
        },
        data: {
          name,
          email,
        },
      })

      // Update student
      const updatedStudent = await tx.student.update({
        where: {
          id,
        },
        data: {
          registrationNo,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          parentName,
          parentContact,
          classId,
        },
      })

      return { user, student: updatedStudent }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: {
        id,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Delete student and user in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete student
      await tx.student.delete({
        where: {
          id,
        },
      })

      // Delete user
      await tx.user.delete({
        where: {
          id: student.userId,
        },
      })
    })

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
