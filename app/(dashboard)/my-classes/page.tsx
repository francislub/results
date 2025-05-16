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
import { Users, BookOpen, BarChart3, CalendarDays, ClipboardList } from "lucide-react"
import { format } from "date-fns"

export const metadata: Metadata = {
  title: "My Classes | School Results System",
  description: "View and manage your assigned classes",
}

export default async function MyClassesPage() {
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

  // Fetch classes where the teacher is the class teacher
  const myClasses = await prisma.class.findMany({
    where: {
      teacherId: teacherId,
    },
    include: {
      _count: {
        select: {
          students: true,
          subjects: true,
          exams: true,
        },
      },
      students: {
        take: 5,
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      subjects: {
        include: {
          subject: true,
        },
      },
      exams: {
        orderBy: {
          startDate: "desc",
        },
        take: 3,
      },
    },
    orderBy: {
      level: "asc",
    },
  })

  // Fetch recent activities related to the teacher's classes
  const recentActivities = await prisma.mark.findMany({
    where: {
      exam: {
        classId: {
          in: myClasses.map((c) => c.id),
        },
      },
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      subject: true,
      exam: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">Manage and view your assigned classes</p>
        </div>
      </div>

      {myClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">No Classes Assigned</h2>
            <p className="text-muted-foreground mb-6">
              You are not currently assigned as a class teacher to any classes.
            </p>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          </TabsList>
          <TabsContent value="classes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClasses.map((classItem) => (
                <Card key={classItem.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{classItem.name}</CardTitle>
                        <CardDescription>
                          Level {classItem.level} • {classItem.academicYear} • Term {classItem.term}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-amber-600 text-white hover:bg-amber-700">
                        Class Teacher
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex flex-col items-center">
                        <Users className="h-5 w-5 text-amber-600 mb-1" />
                        <div className="text-xl font-semibold">{classItem._count.students}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <BookOpen className="h-5 w-5 text-amber-600 mb-1" />
                        <div className="text-xl font-semibold">{classItem._count.subjects}</div>
                        <div className="text-xs text-muted-foreground">Subjects</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <ClipboardList className="h-5 w-5 text-amber-600 mb-1" />
                        <div className="text-xl font-semibold">{classItem._count.exams}</div>
                        <div className="text-xs text-muted-foreground">Exams</div>
                      </div>
                    </div>

                    {classItem.exams.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Recent Exams</h4>
                        <div className="space-y-2">
                          {classItem.exams.map((exam) => (
                            <div key={exam.id} className="flex justify-between items-center text-sm">
                              <span>{exam.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(exam.startDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {classItem.subjects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Subjects</h4>
                        <div className="flex flex-wrap gap-1">
                          {classItem.subjects.slice(0, 5).map((subjectItem) => (
                            <Badge key={subjectItem.id} variant="outline">
                              {subjectItem.subject.name}
                            </Badge>
                          ))}
                          {classItem.subjects.length > 5 && (
                            <Badge variant="outline">+{classItem.subjects.length - 5} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 flex justify-between">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/classes/${classItem.id}/students`}>
                        <Users className="mr-2 h-4 w-4" />
                        Students
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/classes/${classItem.id}`}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Recent marks and updates from your classes</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">No recent activities found for your classes</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 pb-4 border-b">
                        <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                          <CalendarDays className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.student.user.name}</span> scored{" "}
                            <span className="font-medium">{activity.score}</span> in{" "}
                            <span className="font-medium">{activity.subject.name}</span> for{" "}
                            <span className="font-medium">{activity.exam.name}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
