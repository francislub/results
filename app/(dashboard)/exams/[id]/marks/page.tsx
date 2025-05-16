import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Plus, FileDown } from "lucide-react"

export default async function ExamMarksPage({ params }: { params: { id: string } }) {
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

  // Group marks by student for better display
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

  // Calculate average scores
  Object.values(studentMarks).forEach((data) => {
    data.averageScore = data.totalScore / data.marks.length
  })

  // Sort by average score (descending)
  const sortedStudentMarks = Object.values(studentMarks).sort((a, b) => b.averageScore - a.averageScore)

  // Get unique subjects
  const subjects = [...new Set(exam.marks.map((mark) => mark.subject.name))]

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500 text-white"
      case "B":
        return "bg-blue-500 text-white"
      case "C":
        return "bg-yellow-500 text-white"
      case "D":
        return "bg-orange-500 text-white"
      case "E":
      case "F":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" asChild>
                <Link href={`/exams/${params.id}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">{exam.name} Marks</h2>
            </div>
            <p className="text-muted-foreground">
              {exam.term} Term, {exam.academicYear} - {exam.class.name}
            </p>
          </div>
          <div className="flex space-x-2">
            {session.user.role === "ADMIN" || session.user.role === "TEACHER" ? (
              <Button asChild>
                <Link href={`/marks/new?examId=${params.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Marks
                </Link>
              </Button>
            ) : null}
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Summary</CardTitle>
            <CardDescription>
              {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Students</div>
                <div className="text-2xl font-bold">{Object.keys(studentMarks).length}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Subjects</div>
                <div className="text-2xl font-bold">{subjects.length}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Average Score</div>
                <div className="text-2xl font-bold">
                  {sortedStudentMarks.length
                    ? (
                        sortedStudentMarks.reduce((sum, student) => sum + student.averageScore, 0) /
                        sortedStudentMarks.length
                      ).toFixed(2)
                    : "N/A"}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Student Marks</CardTitle>
              <Input placeholder="Search students..." className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    {subjects.map((subject) => (
                      <TableHead key={subject}>{subject}</TableHead>
                    ))}
                    <TableHead>Average</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudentMarks.map((studentData) => {
                    // Create a map of subject to mark for easy lookup
                    const subjectToMark = studentData.marks.reduce(
                      (acc, mark) => {
                        acc[mark.subject.name] = mark
                        return acc
                      },
                      {} as Record<string, any>,
                    )

                    // Determine overall grade based on average score
                    let grade = "F"
                    const avg = studentData.averageScore
                    if (avg >= 80) grade = "A"
                    else if (avg >= 70) grade = "B"
                    else if (avg >= 60) grade = "C"
                    else if (avg >= 50) grade = "D"
                    else if (avg >= 40) grade = "E"

                    return (
                      <TableRow key={studentData.student.id}>
                        <TableCell className="font-medium">
                          <Link href={`/students/${studentData.student.id}`} className="hover:underline text-primary">
                            {studentData.student.user.name}
                          </Link>
                        </TableCell>
                        {subjects.map((subject) => (
                          <TableCell key={subject}>
                            {subjectToMark[subject] ? (
                              <Link
                                href={`/marks/${subjectToMark[subject].id}`}
                                className="hover:underline text-primary"
                              >
                                {subjectToMark[subject].score.toFixed(2)}%
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                        ))}
                        <TableCell>{studentData.averageScore.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(grade)}>{grade}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {sortedStudentMarks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={subjects.length + 3} className="h-24 text-center">
                        No marks recorded for this exam yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
