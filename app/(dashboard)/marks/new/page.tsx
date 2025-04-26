import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkForm } from "@/components/marks/mark-form"

export const metadata: Metadata = {
  title: "Add Marks | Vurra Secondary School",
  description: "Add new marks for students",
}

export default async function AddMarksPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard")
  }

  const teacherId = session.user.teacherId

  // Get classes
  let classes = []
  if (session.user.role === "ADMIN") {
    classes = await prisma.class.findMany({
      orderBy: [
        {
          level: "asc",
        },
        {
          name: "asc",
        },
      ],
    })
  } else {
    classes = await prisma.class.findMany({
      where: {
        OR: [
          { teacherId },
          {
            subjects: {
              some: {
                subject: {
                  teachers: {
                    some: {
                      teacherId,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: [
        {
          level: "asc",
        },
        {
          name: "asc",
        },
      ],
    })
  }

  // Get subjects
  let subjects = []
  if (session.user.role === "ADMIN") {
    subjects = await prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    })
  } else {
    subjects = await prisma.subject.findMany({
      where: {
        teachers: {
          some: {
            teacherId,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
  }

  // Get exams
  const exams = await prisma.exam.findMany({
    where: {
      classId: {
        in: classes.map((c) => c.id),
      },
    },
    orderBy: [
      {
        academicYear: "desc",
      },
      {
        term: "desc",
      },
      {
        startDate: "desc",
      },
    ],
  })

  // Get grading system
  const gradingSystem = await prisma.gradingSystem.findMany({
    orderBy: {
      minScore: "desc",
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Marks</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Mark Entry</CardTitle>
          <CardDescription>Enter marks for a student</CardDescription>
        </CardHeader>
        <CardContent>
          <MarkForm classes={classes} subjects={subjects} exams={exams} gradingSystem={gradingSystem} />
        </CardContent>
      </Card>
    </div>
  )
}
