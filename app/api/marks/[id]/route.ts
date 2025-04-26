import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { calculateGrade } from "@/lib/utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    const mark = await prisma.mark.findUnique({
      where: {
        id,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: true,
        exam: true,
      },
    })

    if (!mark) {
      return NextResponse.json({ error: "Mark not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "STUDENT" && mark.studentId !== session.user.studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role === "TEACHER") {
      // Check if teacher teaches this subject or is class teacher
      const isTeacherForSubject = await prisma.subjectTeacher.findFirst({
        where: {
          teacherId: session.user.teacherId,
          subjectId: mark.subjectId,
        },
      })

      const isClassTeacher = await prisma.class.findFirst({
        where: {
          teacherId: session.user.teacherId,
          students: {
            some: {
              id: mark.studentId,
            },
          },
        },
      })

      if (!isTeacherForSubject && !isClassTeacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    return NextResponse.json(mark)
  } catch (error) {
    console.error("Error fetching mark:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    const { score, comment } = body

    // Check if mark exists
    const mark = await prisma.mark.findUnique({
      where: {
        id,
      },
    })

    if (!mark) {
      return NextResponse.json({ error: "Mark not found" }, { status: 404 })
    }

    // If teacher, check if they teach this subject or are class teacher
    if (session.user.role === "TEACHER") {
      const isTeacherForSubject = await prisma.subjectTeacher.findFirst({
        where: {
          teacherId: session.user.teacherId,
          subjectId: mark.subjectId,
        },
      })

      const isClassTeacher = await prisma.class.findFirst({
        where: {
          teacherId: session.user.teacherId,
          students: {
            some: {
              id: mark.studentId,
            },
          },
        },
      })

      if (!isTeacherForSubject && !isClassTeacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Get grading system
    const gradingSystem = await prisma.gradingSystem.findMany({
      orderBy: {
        minScore: "asc",
      },
    })

    // Calculate grade
    const grade = calculateGrade(score, gradingSystem)

    // Update mark
    const updatedMark = await prisma.mark.update({
      where: {
        id,
      },
      data: {
        score,
        grade,
        comment,
      },
    })

    return NextResponse.json(updatedMark)
  } catch (error) {
    console.error("Error updating mark:", error)
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

    // Check if mark exists
    const mark = await prisma.mark.findUnique({
      where: {
        id,
      },
    })

    if (!mark) {
      return NextResponse.json({ error: "Mark not found" }, { status: 404 })
    }

    // Delete mark
    await prisma.mark.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Mark deleted successfully" })
  } catch (error) {
    console.error("Error deleting mark:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
