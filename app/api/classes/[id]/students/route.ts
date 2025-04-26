import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const classId = params.id

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: {
        id: classId,
      },
    })

    if (!classExists) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Get students in the class
    const students = await prisma.student.findMany({
      where: {
        classId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
