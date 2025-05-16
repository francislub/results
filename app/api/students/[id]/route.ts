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

    const subject = await prisma.subject.findUnique({
      where: {
        id: params.id,
      },
      include: {
        teachers: {
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
          },
        },
        classes: {
          include: {
            class: true,
          },
        },
        _count: {
          select: {
            marks: true,
          },
        },
      },
    })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error("Error fetching subject:", error)
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
    const { name, code, description } = body

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Check if the new code is already taken by another subject
    if (code !== existingSubject.code) {
      const codeExists = await prisma.subject.findUnique({
        where: {
          code,
        },
      })

      if (codeExists) {
        return NextResponse.json({ error: "Subject code already exists" }, { status: 400 })
      }
    }

    // Check if the new name is already taken by another subject
    if (name !== existingSubject.name) {
      const nameExists = await prisma.subject.findUnique({
        where: {
          name,
        },
      })

      if (nameExists) {
        return NextResponse.json({ error: "Subject name already exists" }, { status: 400 })
      }
    }

    // Update subject
    const updatedSubject = await prisma.subject.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        code,
        description,
      },
    })

    return NextResponse.json(updatedSubject)
  } catch (error) {
    console.error("Error updating subject:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: {
        id: params.id,
      },
      include: {
        marks: true,
      },
    })

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Check if subject has marks
    if (existingSubject.marks.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete subject with marks. Please delete marks first." },
        { status: 400 },
      )
    }

    // Delete subject and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete teacher associations
      await tx.subjectTeacher.deleteMany({
        where: {
          subjectId: params.id,
        },
      })

      // Delete class associations
      await tx.classSubject.deleteMany({
        where: {
          subjectId: params.id,
        },
      })

      // Delete the subject
      await tx.subject.delete({
        where: {
          id: params.id,
        },
      })
    })

    return NextResponse.json({ message: "Subject deleted successfully" })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
