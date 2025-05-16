import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, BookOpen, Users, School, Calendar } from "lucide-react"
import { DeleteSubjectButton } from "@/components/subjects/delete-subject-button"

export const metadata: Metadata = {
  title: "Subject Details | Vurra Secondary School",
  description: "View subject details",
}

export default async function SubjectDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const subject = await prisma.subject.findUnique({
    where: {
      id: params.id,
    },
    include: {
      teachers: {
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
        },
      },
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
  })

  if (!subject) {
    redirect("/subjects")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
          <p className="text-muted-foreground">Code: {subject.code}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/subjects/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteSubjectButton id={params.id} name={subject.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subject Information</CardTitle>
            <CardDescription>Basic details about the subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{subject.description || "No description provided."}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p>{new Date(subject.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Overview of subject data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teachers</p>
                  <p className="text-xl font-bold">{subject.teachers.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <School className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classes</p>
                  <p className="text-xl font-bold">{subject.classes.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marks</p>
                  <p className="text-xl font-bold">{subject._count.marks}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{new Date(subject.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teachers</CardTitle>
            <CardDescription>Teachers assigned to this subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subject.teachers.length > 0 ? (
              <div className="space-y-2">
                {subject.teachers.map((st) => (
                  <div key={st.id} className="flex items-center p-2 border rounded-md">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span>{st.teacher.user.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No teachers assigned to this subject yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>Classes where this subject is taught</CardDescription>
          </CardHeader>
          <CardContent>
            {subject.classes.length > 0 ? (
              <div className="space-y-2">
                {subject.classes.map((cs) => (
                  <div key={cs.id} className="flex items-center p-2 border rounded-md">
                    <School className="h-4 w-4 mr-2 text-primary" />
                    <span>{cs.class.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">This subject is not taught in any class yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" asChild>
          <Link href="/subjects">Back to Subjects</Link>
        </Button>
      </div>
    </div>
  )
}
