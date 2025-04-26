import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, FileEdit } from "lucide-react"

export const metadata: Metadata = {
  title: "Mark Details | Vurra Secondary School",
  description: "View mark details",
}

export default async function MarkDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    redirect("/dashboard")
  }

  const mark = await prisma.mark.findUnique({
    where: {
      id: params.id,
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          class: true,
        },
      },
      subject: true,
      exam: true,
    },
  })

  if (!mark) {
    redirect("/marks")
  }

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
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/marks">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Mark Details</h1>
          </div>
          <Button asChild>
            <Link href={`/marks/${mark.id}/edit`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit Mark
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Details about the student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{mark.student.user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Registration Number</p>
                <p className="text-sm text-muted-foreground">{mark.student.registrationNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Class</p>
                <p className="text-sm text-muted-foreground">{mark.student.class?.name || "Not Assigned"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{mark.student.user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mark Information</CardTitle>
              <CardDescription>Details about the mark</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Subject</p>
                <p className="text-sm text-muted-foreground">
                  {mark.subject.name} ({mark.subject.code})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Exam</p>
                <p className="text-sm text-muted-foreground">
                  {mark.exam.name} ({mark.exam.term} - {mark.exam.academicYear})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Score</p>
                <p className="text-sm text-muted-foreground">{mark.score.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Grade</p>
                <Badge className={getGradeColor(mark.grade)}>{mark.grade}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Comment</p>
                <p className="text-sm text-muted-foreground">{mark.comment || "No comment"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Recorded On</p>
                <p className="text-sm text-muted-foreground">{formatDate(mark.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">{formatDate(mark.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  )
}
