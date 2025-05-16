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
    // Use absolute URL with origin from environment variable
    const origin =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
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

async function getSubjects() {
  try {
    // Use absolute URL with origin from environment variable
    const origin =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://results-rosy.vercel.app")
    const res = await fetch(`${origin}/api/subjects`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
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

  // Extract ID at the beginning to avoid params warning
  const teacherId = params.id
  const [teacher, subjects] = await Promise.all([getTeacher(teacherId), getSubjects()])

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
