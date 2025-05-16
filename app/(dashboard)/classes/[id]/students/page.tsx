import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, UserPlus, User, Users } from "lucide-react"
import { ClassStudentsTable } from "@/components/classes/class-students-table"

export const metadata: Metadata = {
  title: "Class Students",
  description: "View and manage students in a class",
}

async function getClass(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/classes/${id}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error("Failed to fetch class")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching class:", error)
    throw new Error("Failed to fetch class")
  }
}

async function getClassStudents(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/classes/${id}/students`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch class students")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching class students:", error)
    throw new Error("Failed to fetch class students")
  }
}

export default async function ClassStudentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const [classData, students] = await Promise.all([getClass(params.id), getClassStudents(params.id)])

  if (!classData) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link href={`/classes/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to class</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{classData.name} Students</h1>
          </div>
          <p className="text-muted-foreground">
            Manage students in {classData.name} • Level {classData.level} • {classData.academicYear} • Term{" "}
            {classData.term}
          </p>
        </div>
        {session.user.role === "ADMIN" && (
          <Button asChild>
            <Link href="/students/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Student
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Students
              </CardTitle>
              <CardDescription>
                {students.length} student{students.length !== 1 ? "s" : ""} enrolled in this class
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <ClassStudentsTable students={students} classId={params.id} />
          ) : (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No Students</h3>
              <p className="text-muted-foreground mb-4">There are no students enrolled in this class yet.</p>
              {session.user.role === "ADMIN" && (
                <Button asChild>
                  <Link href="/students/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New Student
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
