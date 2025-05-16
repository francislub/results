import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { StudentForm } from "@/components/students/student-form"

export const metadata: Metadata = {
  title: "Edit Student",
  description: "Edit student information",
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

async function getClasses() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/classes`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch classes")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching classes:", error)
    throw new Error("Failed to fetch classes")
  }
}

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only admin or the student themselves can edit
  if (session.user.role !== "ADMIN" && session.user.studentId !== params.id) {
    redirect("/dashboard")
  }

  const [student, classes] = await Promise.all([getStudent(params.id), getClasses()])

  if (!student) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
        <p className="text-muted-foreground">Update student information</p>
      </div>
      <div className="space-y-6">
        <StudentForm classes={classes} student={student} />
      </div>
    </div>
  )
}
