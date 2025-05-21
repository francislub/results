import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendReportCardEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classId, emailAddresses, term, academicYear, examId, message } = await request.json()

    // If teacher, check if they teach this class
    if (session.user.role === "TEACHER") {
      const isClassTeacher = await prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: session.user.teacherId,
        },
      })

      const teachesSubjectInClass = await prisma.subjectTeacher.findFirst({
        where: {
          teacherId: session.user.teacherId,
          subject: {
            classes: {
              some: {
                classId,
              },
            },
          },
        },
      })

      if (!isClassTeacher && !teachesSubjectInClass) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Get class details
    const classDetails = await prisma.class.findUnique({
      where: {
        id: classId,
      },
      include: {
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
      },
    })

    if (!classDetails) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Send emails to each student or specified email addresses
    const emailsToSend =
      emailAddresses && emailAddresses.length > 0
        ? emailAddresses
        : classDetails.students.map((student) => student.user.email)

    const results = []

    for (const student of classDetails.students) {
      // Get marks for this student
      const marks = await prisma.mark.findMany({
        where: {
          studentId: student.id,
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
      const overallAverage = marks.length > 0 ? marks.reduce((sum, mark) => sum + mark.score, 0) / marks.length : 0

      // Prepare report data
      const reportData = {
        student,
        examGroups: Object.values(examGroups),
        overallAverage,
        totalExams: Object.keys(examGroups).length,
        totalSubjects: [...new Set(marks.map((mark) => mark.subjectId))].length,
      }

      // Send email to parent/guardian email or student email
      const studentEmails = emailsToSend.filter(
        (email) => email === student.user.email || email === student.parentEmail,
      )

      if (studentEmails.length > 0) {
        const senderName = session.user.role === "ADMIN" ? "School Administration" : session.user.name

        const emailResult = await sendReportCardEmail({
          to: studentEmails.join(", "),
          subject: `Report Card for ${student.user.name}`,
          reportData,
          senderName,
          message,
        })

        results.push({
          student: student.user.name,
          success: emailResult.success,
          error: emailResult.success ? null : emailResult.error,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Report cards sent",
      results,
    })
  } catch (error) {
    console.error("Error sending class report cards:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
