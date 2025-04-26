import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { calculateAverage } from "@/lib/utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { searchParams } = new URL(request.url)
    const term = searchParams.get("term")
    const academicYear = searchParams.get("academicYear")
    const examId = searchParams.get("examId")

    // If teacher, check if they teach this class
    if (session.user.role === "TEACHER") {
      const isClassTeacher = await prisma.class.findFirst({
        where: {
          id,
          teacherId: session.user.teacherId,
        },
      })

      const teachesSubjectInClass = await prisma.subjectTeacher.findFirst({
        where: {
          teacherId: session.user.teacherId,
          subject: {
            classes: {
              some: {
                classId: id,
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
        id,
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
              },
            },
          },
        },
      },
    })

    if (!classDetails) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Get exams
    const exams = await prisma.exam.findMany({
      where: {
        classId: id,
        ...(term ? { term } : {}),
        ...(academicYear ? { academicYear } : {}),
        ...(examId ? { id: examId } : {}),
      },
    })

    if (exams.length === 0) {
      return NextResponse.json({ error: "No exams found for this class" }, { status: 404 })
    }

    // Get all marks for these exams
    const marks = await prisma.mark.findMany({
      where: {
        examId: {
          in: exams.map((exam) => exam.id),
        },
        student: {
          classId: id,
        },
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

    // Group marks by student and exam
    const studentResults = {}

    classDetails.students.forEach((student) => {
      studentResults[student.id] = {
        student,
        exams: {},
        overallAverage: 0,
        totalMarks: [],
      }

      exams.forEach((exam) => {
        studentResults[student.id].exams[exam.id] = {
          exam,
          subjects: [],
          totalScore: 0,
          averageScore: 0,
        }
      })
    })

    // Populate student results
    marks.forEach((mark) => {
      const studentId = mark.studentId
      const examId = mark.examId

      if (studentResults[studentId] && studentResults[studentId].exams[examId]) {
        studentResults[studentId].exams[examId].subjects.push({
          subject: mark.subject,
          score: mark.score,
          grade: mark.grade,
        })
        studentResults[studentId].exams[examId].totalScore += mark.score
        studentResults[studentId].totalMarks.push(mark.score)
      }
    })

    // Calculate averages
    Object.keys(studentResults).forEach((studentId) => {
      const student = studentResults[studentId]

      Object.keys(student.exams).forEach((examId) => {
        const exam = student.exams[examId]
        if (exam.subjects.length > 0) {
          exam.averageScore = calculateAverage(exam.subjects.map((s) => s.score))
        }
      })

      student.overallAverage = calculateAverage(student.totalMarks)
    })

    // Calculate class averages per subject
    const subjectAverages = {}

    classDetails.subjects.forEach((classSubject) => {
      const subjectId = classSubject.subjectId
      subjectAverages[subjectId] = {
        subject: classSubject.subject,
        examAverages: {},
        overallAverage: 0,
        totalMarks: [],
      }

      exams.forEach((exam) => {
        subjectAverages[subjectId].examAverages[exam.id] = {
          exam,
          scores: [],
          averageScore: 0,
        }
      })
    })

    // Populate subject averages
    marks.forEach((mark) => {
      const subjectId = mark.subjectId
      const examId = mark.examId

      if (subjectAverages[subjectId] && subjectAverages[subjectId].examAverages[examId]) {
        subjectAverages[subjectId].examAverages[examId].scores.push(mark.score)
        subjectAverages[subjectId].totalMarks.push(mark.score)
      }
    })

    // Calculate subject averages
    Object.keys(subjectAverages).forEach((subjectId) => {
      const subject = subjectAverages[subjectId]

      Object.keys(subject.examAverages).forEach((examId) => {
        const exam = subject.examAverages[examId]
        if (exam.scores.length > 0) {
          exam.averageScore = calculateAverage(exam.scores)
        }
      })

      subject.overallAverage = calculateAverage(subject.totalMarks)
    })

    // Prepare report data
    const reportData = {
      class: classDetails,
      exams,
      studentResults: Object.values(studentResults),
      subjectAverages: Object.values(subjectAverages),
      classAverage: calculateAverage(marks.map((mark) => mark.score)),
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating class report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
