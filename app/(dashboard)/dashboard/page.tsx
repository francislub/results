import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { AdminStats } from "@/components/dashboard/admin-stats"
import { TeacherStats } from "@/components/dashboard/teacher-stats"
import { StudentStats } from "@/components/dashboard/student-stats"

export const metadata: Metadata = {
  title: "Dashboard | Vurra Secondary School",
  description: "Dashboard for Vurra Secondary School Result Information System",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role
  let dashboardData = {}

  if (role === "ADMIN") {
    const studentsCount = await prisma.student.count()
    const teachersCount = await prisma.teacher.count()
    const classesCount = await prisma.class.count()
    const subjectsCount = await prisma.subject.count()
    const examsCount = await prisma.exam.count()
    const marksCount = await prisma.mark.count()

    // Get recent students
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
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

    // Get recent exams
    const recentExams = await prisma.exam.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        class: true,
      },
    })

    // Get class distribution
    const classCounts = await prisma.class.findMany({
      select: {
        name: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    dashboardData = {
      studentsCount,
      teachersCount,
      classesCount,
      subjectsCount,
      examsCount,
      marksCount,
      recentStudents,
      recentExams,
      classCounts,
    }
  } else if (role === "TEACHER") {
    const teacherId = session.user.teacherId

    if (!teacherId) {
      redirect("/login")
    }

    const classesCount = await prisma.class.count({
      where: {
        teacherId,
      },
    })

    const subjectsCount = await prisma.subjectTeacher.count({
      where: {
        teacherId,
      },
    })

    // Get teacher's classes
    const classes = await prisma.class.findMany({
      where: {
        teacherId,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    // Get teacher's subjects
    const subjects = await prisma.subjectTeacher.findMany({
      where: {
        teacherId,
      },
      include: {
        subject: true,
      },
    })

    // Get recent marks entered by the teacher
    const recentMarks = await prisma.mark.findMany({
      take: 10,
      where: {
        subject: {
          teachers: {
            some: {
              teacherId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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

    dashboardData = {
      classesCount,
      subjectsCount,
      classes,
      subjects,
      recentMarks,
    }
  } else if (role === "STUDENT") {
    const studentId = session.user.studentId

    if (!studentId) {
      redirect("/login")
    }

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        class: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Get student's exams
    const exams = await prisma.exam.findMany({
      where: {
        classId: student?.classId || "",
      },
      orderBy: {
        startDate: "desc",
      },
    })

    // Get student's marks
    const marks = await prisma.mark.findMany({
      where: {
        studentId,
      },
      include: {
        subject: true,
        exam: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate average score
    const averageScore = marks.length > 0 ? marks.reduce((sum, mark) => sum + mark.score, 0) / marks.length : 0

    dashboardData = {
      student,
      exams,
      marks,
      examsCount: exams.length,
      averageScore,
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <DashboardCards role={role} data={dashboardData} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Performance overview for the current term</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview role={role} data={dashboardData} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest activities in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity role={role} data={dashboardData} />
              </CardContent>
            </Card>
          </div>
          {role === "ADMIN" && <AdminStats data={dashboardData} />}
          {role === "TEACHER" && <TeacherStats data={dashboardData} />}
          {role === "STUDENT" && <StudentStats data={dashboardData} />}
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
