import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, BookOpen, BarChart } from "lucide-react"
import Link from "next/link"

export default async function ExamDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const exam = await prisma.exam.findUnique({
    where: {
      id: params.id,
    },
    include: {
      class: true,
      marks: {
        include: {
          student: {
            include: {
              user: true,
            },
          },
          subject: true,
        },
      },
    },
  })

  if (!exam) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <h2 className="text-2xl font-bold">Exam Not Found</h2>
              <p className="text-muted-foreground">The exam you are looking for does not exist.</p>
              <Button asChild className="mt-4">
                <Link href="/exams">Back to Exams</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const totalStudents = new Set(exam.marks.map((mark) => mark.student.id)).size
  const totalSubjects = new Set(exam.marks.map((mark) => mark.subject.id)).size
  const averageScore = exam.marks.length ? exam.marks.reduce((sum, mark) => sum + mark.score, 0) / exam.marks.length : 0

  // Group marks by subject for performance analysis
  const subjectPerformance = exam.marks.reduce(
    (acc, mark) => {
      if (!acc[mark.subject.name]) {
        acc[mark.subject.name] = {
          scores: [],
          totalStudents: 0,
        }
      }
      acc[mark.subject.name].scores.push(mark.score)
      acc[mark.subject.name].totalStudents++
      return acc
    },
    {} as Record<string, { scores: number[]; totalStudents: number }>,
  )

  // Calculate average for each subject
  const subjectAverages = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject,
    average: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
    totalStudents: data.totalStudents,
  }))

  // Get top performers
  const topPerformers = [...exam.marks]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((mark) => ({
      student: mark.student,
      score: mark.score,
      subject: mark.subject,
    }))

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{exam.name}</h2>
          <p className="text-muted-foreground">
            {exam.term} Term, {exam.academicYear}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exam Period</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(exam.startDate)}</div>
              <p className="text-xs text-muted-foreground">to {formatDate(exam.endDate)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Participating students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubjects}</div>
              <p className="text-xs text-muted-foreground">Examined subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
                <CardDescription>Comprehensive information about this examination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Exam Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm text-muted-foreground">Name:</div>
                      <div className="text-sm font-medium">{exam.name}</div>
                      <div className="text-sm text-muted-foreground">Term:</div>
                      <div className="text-sm font-medium">{exam.term}</div>
                      <div className="text-sm text-muted-foreground">Academic Year:</div>
                      <div className="text-sm font-medium">{exam.academicYear}</div>
                      <div className="text-sm text-muted-foreground">Start Date:</div>
                      <div className="text-sm font-medium">{formatDate(exam.startDate)}</div>
                      <div className="text-sm text-muted-foreground">End Date:</div>
                      <div className="text-sm font-medium">{formatDate(exam.endDate)}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Class Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-sm text-muted-foreground">Class:</div>
                      <div className="text-sm font-medium">{exam.class.name}</div>
                      <div className="text-sm text-muted-foreground">Level:</div>
                      <div className="text-sm font-medium">{exam.class.level}</div>
                      <div className="text-sm text-muted-foreground">Academic Year:</div>
                      <div className="text-sm font-medium">{exam.class.academicYear}</div>
                      <div className="text-sm text-muted-foreground">Term:</div>
                      <div className="text-sm font-medium">{exam.class.term}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Overall performance statistics for this exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Marks Recorded</div>
                      <div className="text-2xl font-bold">{exam.marks.length}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Average Score</div>
                      <div className="text-2xl font-bold">{averageScore.toFixed(2)}%</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Highest Score</div>
                      <div className="text-2xl font-bold">
                        {exam.marks.length ? Math.max(...exam.marks.map((mark) => mark.score)).toFixed(2) : "N/A"}%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button asChild>
                      <Link href={`/exams/${params.id}/marks`}>View All Marks</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Performance breakdown by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectAverages.map((subject) => (
                    <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{subject.subject}</h3>
                        <p className="text-sm text-muted-foreground">{subject.totalStudents} students</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{subject.average.toFixed(2)}%</div>
                        <Badge
                          variant={
                            subject.average >= 70 ? "default" : subject.average >= 50 ? "secondary" : "destructive"
                          }
                        >
                          {subject.average >= 70 ? "Excellent" : subject.average >= 50 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-performers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Students with the highest scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{performer.student.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{performer.subject.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{performer.score.toFixed(2)}%</div>
                        <Badge
                          variant={
                            performer.score >= 70 ? "default" : performer.score >= 50 ? "secondary" : "destructive"
                          }
                        >
                          {performer.score >= 70 ? "Excellent" : performer.score >= 50 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
