import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, BarChart3, ClipboardList, BookOpen, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "My Subjects | School Results System",
  description: "View and manage your assigned subjects",
}

export default async function MySubjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  const teacherId = session.user.teacherId

  if (!teacherId) {
    redirect("/dashboard")
  }

  // Fetch subjects taught by the teacher
  const mySubjects = await prisma.subjectTeacher.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      subject: {
        include: {
          classes: {
            include: {
              class: true,
            },
          },
          _count: {
            select: {
              marks: true,
            },
          },
        },
      },
    },
  })

  // Get performance metrics for each subject
  const subjectsWithPerformance = await Promise.all(
    mySubjects.map(async (subjectTeacher) => {
      const subjectId = subjectTeacher.subject.id

      // Get average score for this subject
      const averageScore = await prisma.mark.aggregate({
        where: {
          subjectId: subjectId,
          exam: {
            class: {
              subjects: {
                some: {
                  subjectId: subjectId,
                },
              },
            },
          },
        },
        _avg: {
          score: true,
        },
      })

      // Get highest and lowest scores
      const highestScore = await prisma.mark.findFirst({
        where: {
          subjectId: subjectId,
        },
        orderBy: {
          score: "desc",
        },
        select: {
          score: true,
        },
      })

      const lowestScore = await prisma.mark.findFirst({
        where: {
          subjectId: subjectId,
        },
        orderBy: {
          score: "asc",
        },
        select: {
          score: true,
        },
      })

      // Get student count for this subject
      const studentCount = await prisma.mark.groupBy({
        by: ["studentId"],
        where: {
          subjectId: subjectId,
        },
        _count: true,
      })

      return {
        ...subjectTeacher,
        performance: {
          averageScore: averageScore._avg.score || 0,
          highestScore: highestScore?.score || 0,
          lowestScore: lowestScore?.score || 0,
          studentCount: studentCount.length,
        },
      }
    }),
  )

  // Get classes where the teacher teaches any subject
  const classesWithSubjects = await prisma.class.findMany({
    where: {
      subjects: {
        some: {
          subject: {
            teachers: {
              some: {
                teacherId: teacherId,
              },
            },
          },
        },
      },
    },
    include: {
      subjects: {
        where: {
          subject: {
            teachers: {
              some: {
                teacherId: teacherId,
              },
            },
          },
        },
        include: {
          subject: true,
        },
      },
      _count: {
        select: {
          students: true,
        },
      },
    },
    orderBy: {
      level: "asc",
    },
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subjects</h1>
          <p className="text-muted-foreground">Manage and view your assigned subjects</p>
        </div>
      </div>

      {mySubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">No Subjects Assigned</h2>
            <p className="text-muted-foreground mb-6">You are not currently assigned to teach any subjects.</p>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>
          <TabsContent value="subjects" className="space-y-4">
            <div className="flex items-center mb-4">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search subjects..." className="max-w-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectsWithPerformance.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{item.subject.name}</CardTitle>
                        <CardDescription>Code: {item.subject.code}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-amber-600 text-white hover:bg-amber-700">
                        Teacher
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Average Score</span>
                        <span className="text-xl font-semibold">{item.performance.averageScore.toFixed(1)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Students</span>
                        <span className="text-xl font-semibold">{item.performance.studentCount}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Highest</span>
                        <span className="text-xl font-semibold text-green-600">
                          {item.performance.highestScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Lowest</span>
                        <span className="text-xl font-semibold text-red-600">
                          {item.performance.lowestScore.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {item.subject.classes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Classes</h4>
                        <div className="flex flex-wrap gap-1">
                          {item.subject.classes.map((classSubject) => (
                            <Badge key={classSubject.id} variant="outline">
                              {classSubject.class.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 flex justify-between">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/marks?subjectId=${item.subject.id}`}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Marks
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/subjects/${item.subject.id}`}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="classes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classesWithSubjects.map((classItem) => (
                <Card key={classItem.id}>
                  <CardHeader>
                    <CardTitle>{classItem.name}</CardTitle>
                    <CardDescription>
                      Level {classItem.level} • {classItem.academicYear} • Term {classItem.term}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-muted-foreground mr-1" />
                        <span>{classItem._count.students} students</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-muted-foreground mr-1" />
                        <span>{classItem.subjects.length} subjects</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Your Subjects in this Class</h4>
                      <div className="space-y-2">
                        {classItem.subjects.map((subjectItem) => (
                          <div key={subjectItem.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 text-amber-600 mr-2" />
                              <span>{subjectItem.subject.name}</span>
                            </div>
                            <Badge variant="outline">{subjectItem.subject.code}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/classes/${classItem.id}/students`}>
                        <Users className="mr-2 h-4 w-4" />
                        Students
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/marks/new?classId=${classItem.id}`}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Add Marks
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
