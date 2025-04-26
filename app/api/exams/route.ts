import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let exams

    if (session.user.role === "ADMIN") {
      // Admin can see all exams
      exams = await prisma.exam.findMany({
        include: {
          class: true,
          _count: {
            select: {
              marks: true,
            },
          },
        },
      })
    } else if (session.user.role === "TEACHER") {
      // Teachers can see exams for classes they teach
      exams = await prisma.exam.findMany({
        where: {
          OR: [
            { class: { teacherId: session.user.teacherId } },
            {
              class: {
                subjects: {
                  some: {
                    subject: {
                      teachers: {
                        some: {
                          teacherId: session.user.teacherId,
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          class: true,
          _count: {
            select: {
              marks: true,
            },
          },
        },
      })
    } else {
      // Students can see exams for their class
      const student = await prisma.student.findUnique({
        where: {
          id: session.user.studentId,
        },
        include: {
          class: {
            include: {
              exams: true,
            },
          },
        },
      })

      exams = student?.class?.exams || []
    }

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, term, academicYear, startDate, endDate, classId } = body

    // Check if exam already exists for this class, term and academic year
    const existingExam = await prisma.exam.findFirst({
      where: {
        name,
        term,
        academicYear,
        classId,
      },
    })

    if (existingExam) {
      return NextResponse.json({ error: "Exam already exists for this class, term and academic year" }, { status: 400 })
    }

    // Create exam
    const exam = await prisma.exam.create({
      data: {
        name,
        term,
        academicYear,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        classId,
      },
    })

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
