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

    let classes

    if (session.user.role === "ADMIN") {
      // Admin can see all classes
      classes = await prisma.class.findMany({
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
          _count: {
            select: {
              students: true,
            },
          },
        },
      })
    } else if (session.user.role === "TEACHER") {
      // Teachers can see classes they teach
      classes = await prisma.class.findMany({
        where: {
          OR: [
            { teacherId: session.user.teacherId },
            {
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
          ],
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
          _count: {
            select: {
              students: true,
            },
          },
        },
      })
    } else {
      // Students can only see their own class
      const student = await prisma.student.findUnique({
        where: {
          id: session.user.studentId,
        },
        include: {
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
              _count: {
                select: {
                  students: true,
                },
              },
            },
          },
        },
      })

      classes = student?.class ? [student.class] : []
    }

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Error fetching classes:", error)
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
    const { name, level, academicYear, term, teacherId, subjects } = body

    // Check if class name already exists
    const existingClass = await prisma.class.findUnique({
      where: {
        name,
      },
    })

    if (existingClass) {
      return NextResponse.json({ error: "Class name already exists" }, { status: 400 })
    }

    // Create class and assign subjects in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create class
      const newClass = await tx.class.create({
        data: {
          name,
          level,
          academicYear,
          term,
          teacherId,
        },
      })

      // Assign subjects if provided
      if (subjects && subjects.length > 0) {
        for (const subjectId of subjects) {
          await tx.classSubject.create({
            data: {
              classId: newClass.id,
              subjectId,
            },
          })
        }
      }

      return newClass
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
