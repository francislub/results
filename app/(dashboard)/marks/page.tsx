import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { MarksFilter } from "@/components/marks/marks-filter"
import { MarksTable } from "@/components/marks/marks-table"

export const metadata: Metadata = {
  title: "Marks | Vurra Secondary School",
  description: "Manage student marks and grades",
}

export default async function MarksPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard")
  }

  const teacherId = session.user.teacherId

  // Get subjects taught by the teacher
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

  // Get recent marks
  const recentMarks = await prisma.mark.findMany({
    take: 20,
    where: {
      ...(session.user.role === "TEACHER"
        ? {
            subject: {
              teachers: {
                some: {
                  teacherId,
                },
              },
            },
          }
        : {}),
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
          class: true,
        },
      },
      subject: true,
      exam: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Marks Management</h1>
        <Button asChild>
          <Link href="/marks/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Marks
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Marks</TabsTrigger>
          <TabsTrigger value="by-class">By Class</TabsTrigger>
          <TabsTrigger value="by-subject">By Subject</TabsTrigger>
          <TabsTrigger value="by-exam">By Exam</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Marks</CardTitle>
              <CardDescription>Recently recorded marks in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <MarksTable marks={recentMarks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-class" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marks by Class</CardTitle>
              <CardDescription>View and manage marks by class</CardDescription>
            </CardHeader>
            <CardContent>
              <MarksFilter classes={classes} subjects={subjects} exams={exams} filterType="class" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-subject" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marks by Subject</CardTitle>
              <CardDescription>View and manage marks by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <MarksFilter classes={classes} subjects={subjects} exams={exams} filterType="subject" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-exam" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marks by Exam</CardTitle>
              <CardDescription>View and manage marks by exam</CardDescription>
            </CardHeader>
            <CardContent>
              <MarksFilter classes={classes} subjects={subjects} exams={exams} filterType="exam" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
