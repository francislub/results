import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportGenerator } from "@/components/reports/report-generator"
import { ClassReportGenerator } from "@/components/reports/class-report-generator"

export const metadata: Metadata = {
  title: "Reports | Vurra Secondary School",
  description: "Generate and view academic reports",
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
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
  } else if (session.user.role === "TEACHER") {
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
    const student = await prisma.student.findUnique({
      where: {
        id: session.user.studentId,
      },
      include: {
        class: true,
      },
    })

    if (student?.class) {
      classes = [student.class]
    }
  }

  // Get students
  let students = []
  if (session.user.role === "ADMIN" || session.user.role === "TEACHER") {
    students = await prisma.student.findMany({
      where: {
        classId: {
          in: classes.map((c) => c.id),
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        class: true,
      },
      orderBy: [
        {
          class: {
            name: "asc",
          },
        },
        {
          user: {
            name: "asc",
          },
        },
      ],
    })
  } else {
    students = await prisma.student.findMany({
      where: {
        id: session.user.studentId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        class: true,
      },
    })
  }

  // Get terms and academic years
  const terms = ["Term 1", "Term 2", "Term 3"]
  const currentYear = new Date().getFullYear()
  const academicYears = [
    `${currentYear - 1}/${currentYear}`,
    `${currentYear}/${currentYear + 1}`,
    `${currentYear + 1}/${currentYear + 2}`,
  ]

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>

      <Tabs defaultValue="student" className="space-y-6">
        <TabsList>
          <TabsTrigger value="student">Student Reports</TabsTrigger>
          {(session.user.role === "ADMIN" || session.user.role === "TEACHER") && (
            <TabsTrigger value="class">Class Reports</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="student" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Report Card</CardTitle>
              <CardDescription>Generate report card for a student</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportGenerator students={students} terms={terms} academicYears={academicYears} exams={exams} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Report</CardTitle>
              <CardDescription>Generate report for an entire class</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassReportGenerator classes={classes} terms={terms} academicYears={academicYears} exams={exams} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
