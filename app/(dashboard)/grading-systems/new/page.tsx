import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { GradingForm } from "@/components/grading-systems/grading-form"

export const metadata: Metadata = {
  title: "Add New Grade | School Results Management",
  description: "Create a new grading system for student assessments",
}

export default async function NewGradingSystemPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only admin can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Grade</h1>
        <p className="text-muted-foreground mt-1">Create a new grading system for student assessments</p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
        <GradingForm />
      </div>
    </div>
  )
}
