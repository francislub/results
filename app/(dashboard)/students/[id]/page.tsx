import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { Edit, BookOpen, GraduationCap, BarChart } from "lucide-react"
import { ResultsTable } from "@/components/results/results-table"
import { PerformanceChart } from "@/components/results/performance-chart"

export const metadata: Metadata = {
  title: "Student Details",
  description: "View student details and academic performance",
}

async function getStudent(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/students/${id}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error("Failed to fetch student")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching student:", error)
    throw new Error("Failed to fetch student")
  }
}

export default async function StudentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const student = await getStudent(params.id)

  if (!student) {
    notFound()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Group marks by exam
  const marksByExam = student.marks.reduce((acc, mark) => {
    const examId = mark.exam.id
    if (!acc[examId]) {
      acc[examId] = {
        exam: mark.exam,
        marks: [],
      }
    }
    acc[examId].marks.push(mark)
    return acc
  }, {})

  const examResults = Object.values(marksByExam)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
          <p className="text-muted-foreground">View student information and academic performance</p>
        </div>
        {(session.user.role === "ADMIN" || session.user.studentId === params.id) && (
          <Button asChild variant="outline">
            <Link href={`/students/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Student personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-lg">{getInitials(student.user.name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{student.user.name}</h2>
            <p className="text-muted-foreground mb-2">{student.user.email}</p>
            <Badge className="mb-4">{student.registrationNo}</Badge>
            <div className="w-full text-left space-y-3 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-medium">
                  {student.class ? (
                    <Link href={`/classes/${student.class.id}`} className="hover:underline">
                      {student.class.name}
                    </Link>
                  ) : (
                    "Not assigned"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{student.gender || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {student.dateOfBirth ? format(new Date(student.dateOfBirth), "PPP") : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent/Guardian</p>
                <p className="font-medium">{student.parentName || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent Contact</p>
                <p className="font-medium">{student.parentContact || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{student.address || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>View exam results and performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results">
              <TabsList className="mb-4">
                <TabsTrigger value="results">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="performance">
                  <BarChart className="mr-2 h-4 w-4" />
                  Performance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="results">
                {examResults.length > 0 ? (
                  <div className="space-y-6">
                    {examResults.map((examResult: any) => (
                      <Card key={examResult.exam.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{examResult.exam.name}</CardTitle>
                          <CardDescription>
                            {examResult.exam.academicYear} • Term {examResult.exam.term}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResultsTable results={examResult.marks} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">No Results Available</h3>
                    <p className="text-muted-foreground">This student has no exam results recorded yet.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="performance">
                {student.marks.length > 0 ? (
                  <PerformanceChart marks={student.marks} />
                ) : (
                  <div className="text-center py-6">
                    <BarChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">No Performance Data</h3>
                    <p className="text-muted-foreground">
                      Performance chart will be available once exam results are recorded.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
