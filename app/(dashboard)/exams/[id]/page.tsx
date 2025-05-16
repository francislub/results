import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, PenSquare, Users } from "lucide-react"

export default async function ExamDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  // Extract the ID to avoid using params.id directly
  const examId = params.id

  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
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

  // Group marks by subject for better display
  const subjectMarks = exam.marks.reduce(
    (acc, mark) => {
      if (!acc[mark.subject.id]) {
        acc[mark.subject.id] = {
          subject: mark.subject,
          marks: [],
          totalScore: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 100,
        }
      }
      acc[mark.subject.id].marks.push(mark)
      acc[mark.subject.id].totalScore += mark.score
      acc[mark.subject.id].highestScore = Math.max(acc[mark.subject.id].highestScore, mark.score)
      acc[mark.subject.id].lowestScore = Math.min(acc[mark.subject.id].lowestScore, mark.score)
      return acc
    },
    {} as Record<
      string,
      {
        subject: any
        marks: any[]
        totalScore: number
        averageScore: number
        highestScore: number
        lowestScore: number
      }
    >,
  )

  // Calculate average scores
  Object.values(subjectMarks).forEach((data) => {
    data.averageScore = data.totalScore / data.marks.length
  })

  // Sort by average score (descending)
  const sortedSubjectMarks = Object.values(subjectMarks).sort((a, b) => b.averageScore - a.averageScore)

  // Group marks by student for top performers
  const studentMarks = exam.marks.reduce(
    (acc, mark) => {
      if (!acc[mark.student.id]) {
        acc[mark.student.id] = {
          student: mark.student,
          marks: [],
          totalScore: 0,
          averageScore: 0,
        }
      }
      acc[mark.student.id].marks.push(mark)
      acc[mark.student.id].totalScore += mark.score
      return acc
    },
    {} as Record<string, { student: any; marks: any[]; totalScore: number; averageScore: number }>,
  )

  // Calculate average scores for students
  Object.values(studentMarks).forEach((data) => {
    data.averageScore = data.totalScore / data.marks.length
  })

  // Get top 5 performers
  const topPerformers = Object.values(studentMarks)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5)

  // Calculate overall exam statistics
  const totalStudents = Object.keys(studentMarks).length
  const totalSubjects = Object.keys(subjectMarks).length
  const overallAverage =
    totalStudents > 0
      ? Object.values(studentMarks).reduce((sum, student) => sum + student.averageScore, 0) / totalStudents
      : 0

  // Get grade distribution
  const gradeDistribution = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  }

  Object.values(studentMarks).forEach((student) => {
    const avg = student.averageScore
    if (avg >= 80) gradeDistribution.A++
    else if (avg >= 70) gradeDistribution.B++
    else if (avg >= 60) gradeDistribution.C++
    else if (avg >= 50) gradeDistribution.D++
    else if (avg >= 40) gradeDistribution.E++
    else gradeDistribution.F++
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/exams">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">{exam.name}</h2>
              <Badge variant="outline" className="ml-2">
                {exam.term} Term
              </Badge>
              <Badge variant="outline">{exam.academicYear}</Badge>
            </div>
            <p className="text-muted-foreground">
              {formatDate(exam.startDate)} to {formatDate(exam.endDate)} • {exam.class.name}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href={`/exams/${examId}/marks`}>
                <Users className="mr-2 h-4 w-4" />
                View Marks
              </Link>
            </Button>
            {session.user.role === "ADMIN" || session.user.role === "TEACHER" ? (
              <Button asChild>
                <Link href={`/marks/new?examId=${examId}`}>
                  <PenSquare className="mr-2 h-4 w-4" />
                  Add Marks
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-600 font-medium">Students</div>
              <div className="text-3xl font-bold text-blue-800">{totalStudents}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-sm text-green-600 font-medium">Subjects</div>
              <div className="text-3xl font-bold text-green-800">{totalSubjects}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-sm text-purple-600 font-medium">Average Score</div>
              <div className="text-3xl font-bold text-purple-800">{overallAverage.toFixed(2)}%</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="text-sm text-amber-600 font-medium">Pass Rate</div>
              <div className="text-3xl font-bold text-amber-800">
                {totalStudents
                  ? (
                      ((gradeDistribution.A + gradeDistribution.B + gradeDistribution.C + gradeDistribution.D) /
                        totalStudents) *
                      100
                    ).toFixed(2)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
            <TabsTrigger value="students">Top Performers</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Distribution of grades across all students in this exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-green-600">{gradeDistribution.A}</div>
                    <div className="text-sm text-muted-foreground">Grade A</div>
                    <div
                      className="w-full bg-green-500 mt-2 rounded-sm"
                      style={{
                        height: `${totalStudents ? (gradeDistribution.A / totalStudents) * 100 : 0}px`,
                        minHeight: "4px",
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-blue-600">{gradeDistribution.B}</div>
                    <div className="text-sm text-muted-foreground">Grade B</div>
                    <div
                      className="w-full bg-blue-500 mt-2 rounded-sm"
                      style={{
                        height: `${totalStudents ? (gradeDistribution.B / totalStudents) * 100 : 0}px`,
                        minHeight: "4px",
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-yellow-600">{gradeDistribution.C}</div>
                    <div className="text-sm text-muted-foreground">Grade C</div>
                    <div
                      className="w-full bg-yellow-500 mt-2 rounded-sm"
                      style={{
                        height: `${totalStudents ? (gradeDistribution.C / totalStudents) * 100 : 0}px`,
                        minHeight: "4px",
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-orange-600">{gradeDistribution.D}</div>
                    <div className="text-sm text-muted-foreground">Grade D</div>
                    <div
                      className="w-full bg-orange-500 mt-2 rounded-sm"
                      style={{
                        height: `${totalStudents ? (gradeDistribution.D / totalStudents) * 100 : 0}px`,
                        minHeight: "4px",
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-amber-600">{gradeDistribution.E}</div>
                    <div className="text-sm text-muted-foreground">Grade E</div>
                    <div
                      className="w-full bg-amber-500 mt-2 rounded-sm"
                      style={{
                        height: `${totalStudents ? (gradeDistribution.E / totalStudents) * 100 : 0}px`,
                        minHeight: "4px",
                      }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold text-red-600">{gradeDistribution.F}</div>
                    <div className="text-sm text-muted-foreground">Grade F</div>
                    <div
                      className="w-full bg-red-500 mt-2 rounded-sm"
                      style={{
                        height: `${totalStudents ? (gradeDistribution.F / totalStudents) * 100 : 0}px`,
                        minHeight: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="text-sm font-semibold">{exam.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Class</dt>
                      <dd className="text-sm font-semibold">{exam.class.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Term</dt>
                      <dd className="text-sm font-semibold">{exam.term}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Academic Year</dt>
                      <dd className="text-sm font-semibold">{exam.academicYear}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                      <dd className="text-sm font-semibold">{formatDate(exam.startDate)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                      <dd className="text-sm font-semibold">{formatDate(exam.endDate)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Highest Average</dt>
                      <dd className="text-sm font-semibold">
                        {topPerformers.length > 0
                          ? `${topPerformers[0].student.user.name} (${topPerformers[0].averageScore.toFixed(2)}%)`
                          : "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Best Subject</dt>
                      <dd className="text-sm font-semibold">
                        {sortedSubjectMarks.length > 0
                          ? `${sortedSubjectMarks[0].subject.name} (${sortedSubjectMarks[0].averageScore.toFixed(2)}%)`
                          : "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Lowest Subject</dt>
                      <dd className="text-sm font-semibold">
                        {sortedSubjectMarks.length > 0
                          ? `${sortedSubjectMarks[sortedSubjectMarks.length - 1].subject.name} (${sortedSubjectMarks[
                              sortedSubjectMarks.length - 1
                            ].averageScore.toFixed(2)}%)`
                          : "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Students with A</dt>
                      <dd className="text-sm font-semibold">{gradeDistribution.A}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Students with F</dt>
                      <dd className="text-sm font-semibold">{gradeDistribution.F}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Total Marks</dt>
                      <dd className="text-sm font-semibold">{exam.marks.length}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Average scores for each subject in this exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Highest Score</TableHead>
                        <TableHead>Lowest Score</TableHead>
                        <TableHead>Students</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSubjectMarks.map((subjectData) => (
                        <TableRow key={subjectData.subject.id}>
                          <TableCell className="font-medium">{subjectData.subject.name}</TableCell>
                          <TableCell>{subjectData.averageScore.toFixed(2)}%</TableCell>
                          <TableCell>{subjectData.highestScore.toFixed(2)}%</TableCell>
                          <TableCell>{subjectData.lowestScore.toFixed(2)}%</TableCell>
                          <TableCell>{subjectData.marks.length}</TableCell>
                        </TableRow>
                      ))}
                      {sortedSubjectMarks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No marks recorded for this exam yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Students with the highest average scores in this exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPerformers.map((studentData, index) => {
                        // Determine grade based on average score
                        let grade = "F"
                        const avg = studentData.averageScore
                        if (avg >= 80) grade = "A"
                        else if (avg >= 70) grade = "B"
                        else if (avg >= 60) grade = "C"
                        else if (avg >= 50) grade = "D"
                        else if (avg >= 40) grade = "E"

                        return (
                          <TableRow key={studentData.student.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              <Link
                                href={`/students/${studentData.student.id}`}
                                className="hover:underline text-primary"
                              >
                                {studentData.student.user.name}
                              </Link>
                            </TableCell>
                            <TableCell>{studentData.averageScore.toFixed(2)}%</TableCell>
                            <TableCell>{studentData.marks.length}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  grade === "A"
                                    ? "bg-green-500 text-white"
                                    : grade === "B"
                                      ? "bg-blue-500 text-white"
                                      : grade === "C"
                                        ? "bg-yellow-500 text-white"
                                        : grade === "D"
                                          ? "bg-orange-500 text-white"
                                          : "bg-red-500 text-white"
                                }
                              >
                                {grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {topPerformers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No marks recorded for this exam yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
