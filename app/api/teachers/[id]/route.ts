import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    const teacher = await prisma.teacher.findUnique({
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
        subjects: {
          include: {
            subject: true,
          },
        },
        classTeacher: true,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error fetching teacher:", error)
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
    const { name, email, password, staffId, qualification, gender, dateOfBirth, contact, address, subjects } = body

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        subjects: true,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    // Update user and teacher in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const userData: any = {
        name,
        email,
      }

      // Only hash and update password if provided
      if (password) {
        userData.password = await hash(password, 10)
      }

      const user = await tx.user.update({
        where: {
          id: teacher.userId,
        },
        data: userData,
      })

      // Update teacher
      const updatedTeacher = await tx.teacher.update({
        where: {
          id,
        },
        data: {
          staffId,
          qualification,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          contact,
          address,
        },
      })

      // Delete existing subject assignments
      await tx.subjectTeacher.deleteMany({
        where: {
          teacherId: id,
        },
      })

      // Create new subject assignments
      if (subjects && subjects.length > 0) {
        await Promise.all(
          subjects.map((subjectId: string) =>
            tx.subjectTeacher.create({
              data: {
                teacherId: id,
                subjectId,
              },
            }),
          ),
        )
      }

      return { user, teacher: updatedTeacher }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating teacher:", error)
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

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
      include: {
        classTeacher: true,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    // Check if teacher is assigned to any classes
    if (teacher.classTeacher.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete teacher who is assigned as a class teacher. Please reassign the classes first." },
        { status: 400 },
      )
    }

    // Delete teacher and user in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete subject assignments
      await tx.subjectTeacher.deleteMany({
        where: {
          teacherId: id,
        },
      })

      // Delete teacher
      await tx.teacher.delete({
        where: {
          id,
        },
      })

      // Delete user
      await tx.user.delete({
        where: {
          id: teacher.userId,
        },
      })
    })

    return NextResponse.json({ message: "Teacher deleted successfully" })
  } catch (error) {
    console.error("Error deleting teacher:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
