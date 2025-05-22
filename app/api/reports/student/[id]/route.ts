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

    // Get all subjects for the student's class
    const classSubjects = await prisma.subject.findMany({
      where: {
        classes: {
          some: {
            id: student.classId,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

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
    const overallAverage = marks.length > 0 ? calculateAverage(marks.map((mark) => mark.score)) : 0

    // Get attendance data if available
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: id,
        ...(term ? { term } : {}),
        ...(academicYear ? { academicYear } : {}),
      },
    })

    // Calculate attendance statistics
    const attendanceStats = attendance.reduce(
      (stats, record) => {
        if (record.status === "PRESENT") stats.present++
        else if (record.status === "ABSENT") stats.absent++
        else if (record.status === "LATE") stats.late++
        stats.total++
        return stats
      },
      { present: 0, absent: 0, late: 0, total: 0 },
    )

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

    // Prepare report data
    const reportData = {
      student,
      classSubjects,
      examGroups: Object.values(examGroups),
      overallAverage,
      totalExams: Object.keys(examGroups).length,
      totalSubjects: classSubjects.length,
      attendance: attendanceStats.total > 0 ? attendanceStats : null,
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

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating student report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
