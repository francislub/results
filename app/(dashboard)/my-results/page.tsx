import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ResultsTable } from "@/components/results/results-table"
import { PerformanceChart } from "@/components/results/performance-chart"

export const metadata: Metadata = {
  title: "My Results | Vurra Secondary School",
  description: "View your academic results",
}

export default async function MyResultsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  const studentId = session.user.studentId

  if (!studentId) {
    redirect("/dashboard")
  }

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
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

  if (!student) {
    redirect("/dashboard")
  }

  // Get all exams for the student's class
  const exams = await prisma.exam.findMany({
    where: {
      classId: student.classId,
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

  // Get all marks for the student
  const marks = await prisma.mark.findMany({
    where: {
      studentId,
    },
    include: {
      subject: true,
      exam: true,
    },
    orderBy: [
      {
        exam: {
          academicYear: "desc",
        },
      },
      {
        exam: {
          term: "desc",
        },
      },
      {
        subject: {
          name: "asc",
        },
      },
    ],
  })

  // Group marks by exam
  const examResults = {}

  exams.forEach((exam) => {
    examResults[exam.id] = {
      exam,
      marks: marks.filter((mark) => mark.examId === exam.id),
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Your personal and academic information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{student.user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Registration Number</p>
              <p className="text-sm text-muted-foreground">{student.registrationNo}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Class</p>
              <p className="text-sm text-muted-foreground">{student.class?.name || "Not Assigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Academic Year</p>
              <p className="text-sm text-muted-foreground">{student.class?.academicYear || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={exams[0]?.id || "overview"} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {exams.map((exam) => (
            <TabsTrigger key={exam.id} value={exam.id}>
              {exam.name} ({exam.term} - {exam.academicYear})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your performance across all exams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <PerformanceChart marks={marks} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {exams.map((exam) => (
          <TabsContent key={exam.id} value={exam.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {exam.name} ({exam.term} - {exam.academicYear})
                </CardTitle>
                <CardDescription>Your results for this examination</CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsTable marks={examResults[exam.id]?.marks || []} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
