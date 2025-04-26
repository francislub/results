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

    let subjects

    if (session.user.role === "ADMIN") {
      // Admin can see all subjects
      subjects = await prisma.subject.findMany({
        include: {
          teachers: {
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
          classes: {
            include: {
              class: true,
            },
          },
        },
      })
    } else if (session.user.role === "TEACHER") {
      // Teachers can see subjects they teach
      subjects = await prisma.subject.findMany({
        where: {
          teachers: {
            some: {
              teacherId: session.user.teacherId,
            },
          },
        },
        include: {
          classes: {
            include: {
              class: true,
            },
          },
        },
      })
    } else {
      // Students can see subjects in their class
      const student = await prisma.student.findUnique({
        where: {
          id: session.user.studentId,
        },
        include: {
          class: {
            include: {
              subjects: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      })

      subjects = student?.class?.subjects.map((cs) => cs.subject) || []
    }

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
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
    const { name, code, description } = body

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: {
        code,
      },
    })

    if (existingSubject) {
      return NextResponse.json({ error: "Subject code already exists" }, { status: 400 })
    }

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        description,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
