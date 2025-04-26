import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { calculateGrade } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const studentId = searchParams.get("studentId")
    const subjectId = searchParams.get("subjectId")

    let marks

    if (session.user.role === "ADMIN") {
      // Admin can see all marks
      marks = await prisma.mark.findMany({
        where: {
          ...(examId ? { examId } : {}),
          ...(studentId ? { studentId } : {}),
          ...(subjectId ? { subjectId } : {}),
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
    } else if (session.user.role === "TEACHER") {
      // Teachers can see marks for subjects they teach
      marks = await prisma.mark.findMany({
        where: {
          ...(examId ? { examId } : {}),
          ...(studentId ? { studentId } : {}),
          ...(subjectId ? { subjectId } : {}),
          OR: [
            {
              subject: {
                teachers: {
                  some: {
                    teacherId: session.user.teacherId,
                  },
                },
              },
            },
            {
              student: {
                class: {
                  teacherId: session.user.teacherId,
                },
              },
            },
          ],
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
    } else {
      // Students can only see their own marks
      marks = await prisma.mark.findMany({
        where: {
          studentId: session.user.studentId,
          ...(examId ? { examId } : {}),
          ...(subjectId ? { subjectId } : {}),
        },
        include: {
          subject: true,
          exam: true,
        },
      })
    }

    return NextResponse.json(marks)
  } catch (error) {
    console.error("Error fetching marks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, subjectId, examId, score, comment } = body

    // Check if mark already exists
    const existingMark = await prisma.mark.findUnique({
      where: {
        studentId_subjectId_examId: {
          studentId,
          subjectId,
          examId,
        },
      },
    })

    if (existingMark) {
      return NextResponse.json({ error: "Mark already exists for this student, subject and exam" }, { status: 400 })
    }

    // Get grading system
    const gradingSystem = await prisma.gradingSystem.findMany({
      orderBy: {
        minScore: "asc",
      },
    })

    // Calculate grade
    const grade = calculateGrade(score, gradingSystem)

    // Create mark
    const mark = await prisma.mark.create({
      data: {
        studentId,
        subjectId,
        examId,
        score,
        grade,
        comment,
      },
    })

    return NextResponse.json(mark, { status: 201 })
  } catch (error) {
    console.error("Error creating mark:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
