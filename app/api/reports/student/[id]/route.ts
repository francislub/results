import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { calculateAverage } from "@/lib/utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { searchParams } = new URL(request.url)
    const term = searchParams.get("term")
    const academicYear = searchParams.get("academicYear")
    const examId = searchParams.get("examId")

    // Check permissions
    if (session.user.role === "STUDENT" && session.user.studentId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student details
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
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get marks
    const marks = await prisma.mark.findMany({
      where: {
        studentId: id,
        ...(examId
          ? { examId }
          : {
              exam: {
                ...(term ? { term } : {}),
                ...(academicYear ? { academicYear } : {}),
              },
            }),
      },
      include: {
        subject: true,
        exam: true,
      },
      orderBy: {
        subject: {
          name: "asc",
        },
      },
    })

    // Group marks by exam
    const examGroups = marks.reduce((groups, mark) => {
      const examId = mark.examId
      if (!groups[examId]) {
        groups[examId] = {
          exam: mark.exam,
          subjects: [],
          totalScore: 0,
          averageScore: 0,
        }
      }
      groups[examId].subjects.push({
        subject: mark.subject,
        score: mark.score,
        grade: mark.grade,
        comment: mark.comment,
      })
      groups[examId].totalScore += mark.score
      return groups
    }, {})

    // Calculate averages
    Object.keys(examGroups).forEach((examId) => {
      const group = examGroups[examId]
      group.averageScore = calculateAverage(group.subjects.map((s) => s.score))
    })

    // Calculate overall average
    const overallAverage = calculateAverage(marks.map((mark) => mark.score))

    // Prepare report data
    const reportData = {
      student,
      examGroups: Object.values(examGroups),
      overallAverage,
      totalExams: Object.keys(examGroups).length,
      totalSubjects: [...new Set(marks.map((mark) => mark.subjectId))].length,
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating student report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
