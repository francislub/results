import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, Users, BookOpen, GraduationCap, Calendar } from "lucide-react"
import { DeleteClassButton } from "@/components/classes/delete-class-button"

export const metadata: Metadata = {
  title: "Class Details | Vurra Secondary School",
  description: "View class details",
}

export default async function ClassDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const classItem = await prisma.class.findUnique({
    where: {
      id: params.id,
    },
    include: {
      teacher: {
        include: {
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
      _count: {
        select: {
          students: true,
          exams: true,
        },
      },
    },
  })

  if (!classItem) {
    redirect("/classes")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{classItem.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/classes/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteClassButton id={params.id} name={classItem.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
            <CardDescription>Basic details about the class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p>{classItem.level}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                <p>{classItem.academicYear}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Term</p>
                <p>{classItem.term}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Class Teacher</p>
                <p>{classItem.teacher?.user?.name || "Not Assigned"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Overview of class data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  <p className="text-xl font-bold">{classItem._count.students}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                  <p className="text-xl font-bold">{classItem.subjects.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exams</p>
                  <p className="text-xl font-bold">{classItem._count.exams}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(classItem.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Subjects taught in this class</CardDescription>
          </CardHeader>
          <CardContent>
            {classItem.subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {classItem.subjects.map((cs) => (
                  <div key={cs.id} className="flex items-center p-2 border rounded-md">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      {cs.subject.name} ({cs.subject.code})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No subjects assigned to this class yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mt-4">
        <Button asChild>
          <Link href={`/classes/${params.id}/students`}>
            <Users className="mr-2 h-4 w-4" />
            Manage Students
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/classes">Back to Classes</Link>
        </Button>
      </div>
    </div>
  )
}
