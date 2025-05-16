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

    const classItem = await prisma.class.findUnique({
      where: {
        id: params.id,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            subjects: true,
            exams: true,
          },
        },
      },
    })

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    return NextResponse.json(classItem)
  } catch (error) {
    console.error("Error fetching class:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, level, academicYear, term, teacherId, subjects } = body

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Check if the new name is already taken by another class
    if (name !== existingClass.name) {
      const nameExists = await prisma.class.findUnique({
        where: {
          name,
        },
      })

      if (nameExists) {
        return NextResponse.json({ error: "Class name already exists" }, { status: 400 })
      }
    }

    // Update class and subjects in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update class
      const updatedClass = await tx.class.update({
        where: {
          id: params.id,
        },
        data: {
          name,
          level,
          academicYear,
          term,
          teacherId,
        },
      })

      // Delete existing subject associations
      await tx.classSubject.deleteMany({
        where: {
          classId: params.id,
        },
      })

      // Create new subject associations
      if (subjects && subjects.length > 0) {
        for (const subjectId of subjects) {
          await tx.classSubject.create({
            data: {
              classId: params.id,
              subjectId,
            },
          })
        }
      }

      return updatedClass
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: {
        id: params.id,
      },
      include: {
        students: true,
        exams: true,
      },
    })

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Check if class has students
    if (existingClass.students.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete class with students. Please reassign or remove students first." },
        { status: 400 },
      )
    }

    // Check if class has exams
    if (existingClass.exams.length > 0) {
      return NextResponse.json({ error: "Cannot delete class with exams. Please delete exams first." }, { status: 400 })
    }

    // Delete class and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete subject associations
      await tx.classSubject.deleteMany({
        where: {
          classId: params.id,
        },
      })

      // Delete the class
      await tx.class.delete({
        where: {
          id: params.id,
        },
      })
    })

    return NextResponse.json({ message: "Class deleted successfully" })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
