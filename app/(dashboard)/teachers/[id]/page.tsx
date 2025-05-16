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
import { Edit, Users, BookOpen, GraduationCap } from "lucide-react"
import DeleteTeacherButton from "@/components/teachers/delete-teacher-button"

export const metadata: Metadata = {
  title: "Teacher Details",
  description: "View teacher details and information",
}

async function getTeacher(id: string) {
  try {
    // Use absolute URL with origin from environment variable
    const origin =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://results-rosy.vercel.app")
    const res = await fetch(`${origin}/api/teachers/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error("Failed to fetch teacher")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching teacher:", error)
    throw new Error("Failed to fetch teacher")
  }
}

export default async function TeacherPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Extract ID at the beginning to avoid params warning
  const teacherId = params.id
  const teacher = await getTeacher(teacherId)

  if (!teacher) {
    notFound()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Profile</h1>
          <p className="text-muted-foreground">View and manage teacher information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/teachers/${teacherId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {session.user.role === "ADMIN" && <DeleteTeacherButton id={teacherId} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Teacher personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-lg">{getInitials(teacher.user.name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{teacher.user.name}</h2>
            <p className="text-muted-foreground mb-2">{teacher.user.email}</p>
            <Badge className="mb-4">{teacher.staffId}</Badge>
            <div className="w-full text-left space-y-3 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Qualification</p>
                <p className="font-medium">{teacher.qualification || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{teacher.gender || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {teacher.dateOfBirth ? format(new Date(teacher.dateOfBirth), "PPP") : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{teacher.contact || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{teacher.address || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Teaching Information</CardTitle>
            <CardDescription>Classes and subjects taught by this teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classes">
              <TabsList className="mb-4">
                <TabsTrigger value="classes">
                  <Users className="mr-2 h-4 w-4" />
                  Classes
                </TabsTrigger>
                <TabsTrigger value="subjects">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Subjects
                </TabsTrigger>
              </TabsList>
              <TabsContent value="classes">
                {teacher.classTeacher && teacher.classTeacher.length > 0 ? (
                  <div className="space-y-4">
                    {teacher.classTeacher.map((classItem) => (
                      <Card key={classItem.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{classItem.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Level {classItem.level} • {classItem.academicYear} • Term {classItem.term}
                              </p>
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/classes/${classItem.id}`}>
                                <GraduationCap className="mr-2 h-4 w-4" />
                                View Class
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">No Classes Assigned</h3>
                    <p className="text-muted-foreground">This teacher is not assigned as a class teacher yet.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="subjects">
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  <div className="space-y-4">
                    {teacher.subjects.map((subjectTeacher) => (
                      <Card key={subjectTeacher.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{subjectTeacher.subject.name}</h3>
                              <p className="text-sm text-muted-foreground">Code: {subjectTeacher.subject.code}</p>
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/subjects/${subjectTeacher.subject.id}`}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                View Subject
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">No Subjects Assigned</h3>
                    <p className="text-muted-foreground">This teacher is not assigned to teach any subjects yet.</p>
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
