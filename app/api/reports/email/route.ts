import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendReportCardEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentId, emailAddress, term, academicYear, examId, message } = await request.json()

    // Check permissions
    if (session.user.role === "STUDENT" && session.user.studentId !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student details
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
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
        studentId,
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
      group.averageScore = group.totalScore / group.subjects.length
    })

    // Calculate overall average
    const overallAverage = marks.reduce((sum, mark) => sum + mark.score, 0) / marks.length

    // Prepare report data
    const reportData = {
      student,
      examGroups: Object.values(examGroups),
      overallAverage,
      totalExams: Object.keys(examGroups).length,
      totalSubjects: [...new Set(marks.map((mark) => mark.subjectId))].length,
    }

    // Send email
    const senderName =
      session.user.role === "ADMIN"
        ? "School Administration"
        : session.user.role === "TEACHER"
          ? session.user.name
          : student.user.name

    const emailResult = await sendReportCardEmail({
      to: emailAddress,
      subject: `Report Card for ${student.user.name}`,
      reportData,
      senderName,
      message,
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Report card sent successfully" })
  } catch (error) {
    console.error("Error sending report card email:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
