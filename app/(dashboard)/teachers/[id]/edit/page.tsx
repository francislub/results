import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { TeacherForm } from "@/components/teachers/teacher-form"

export const metadata: Metadata = {
  title: "Edit Teacher",
  description: "Edit teacher information",
}

async function getTeacher(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/teachers/${id}`, {
      cache: "no-store",
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

async function getSubjects() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/subjects`, {
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch subjects")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching subjects:", error)
    throw new Error("Failed to fetch subjects")
  }
}

export default async function EditTeacherPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [teacher, subjects] = await Promise.all([getTeacher(params.id), getSubjects()])

  if (!teacher) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Teacher</h1>
        <p className="text-muted-foreground">Update teacher information</p>
      </div>
      <div className="space-y-6">
        <TeacherForm subjects={subjects} teacher={teacher} />
      </div>
    </div>
  )
}
