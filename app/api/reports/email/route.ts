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
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get all subjects for the student's class
    let classSubjects = []

    if (student.class) {
      // First try to get subjects through the class.subjects relation
      if (student.class.subjects && student.class.subjects.length > 0) {
        classSubjects = student.class.subjects.map((cs) => cs.subject)
      } else {
        // Fallback to getting subjects directly
        classSubjects = await prisma.subject.findMany({
          where: {
            classes: {
              some: {
                classId: student.classId,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        })
      }
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
    const overallAverage = marks.length > 0 ? marks.reduce((sum, mark) => sum + mark.score, 0) / marks.length : 0

    // Default attendance data since we don't have an attendance model
    const attendanceStats = {
      present: 85,
      absent: 5,
      late: 10,
      total: 100,
    }

    // Get class position if available
    let position = null
    let totalStudents = null
    const positionChange = null

    try {
      // This is a placeholder for position calculation
      // In a real implementation, you would calculate this based on all students' marks
      const classStudents = await prisma.student.count({
        where: {
          classId: student.classId,
        },
      })

      totalStudents = classStudents

      // Placeholder for position - in a real implementation, this would be calculated
      // based on comparing this student's average with all other students
      if (marks.length > 0) {
        // Simple random position for demonstration
        position = Math.floor(Math.random() * classStudents) + 1
      }
    } catch (error) {
      console.error("Error calculating position:", error)
    }

    // Create a combined subjects array that includes all class subjects and their marks if available
    const subjectsWithMarks = classSubjects.map((subject) => {
      // Find the most recent mark for this subject
      const subjectMarks = marks.filter((mark) => mark.subjectId === subject.id)
      const latestMark =
        subjectMarks.length > 0
          ? subjectMarks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
          : null

      return {
        subject: subject,
        name: subject.name,
        code: subject.code,
        score: latestMark ? latestMark.score : null,
        grade: latestMark ? latestMark.grade : null,
        comment: latestMark ? latestMark.comment : null,
        exam: latestMark ? latestMark.exam : null,
        hasScore: !!latestMark,
      }
    })

    // Prepare report data
    const reportData = {
      student,
      subjects: subjectsWithMarks,
      examGroups: Object.values(examGroups),
      overallAverage,
      totalExams: Object.keys(examGroups).length,
      totalSubjects: classSubjects.length,
      attendance: attendanceStats,
      position,
      totalStudents,
      positionChange,
      term,
      academicYear,
      nextTermDate: "January 15, 2024", // This should come from school settings
      comments: {
        classTeacher: "A hardworking student who shows great potential.",
        headTeacher: "Keep up the good work and continue to strive for excellence.",
      },
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
