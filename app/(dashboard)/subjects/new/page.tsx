import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubjectForm } from "@/components/subjects/subject-form"

export const metadata: Metadata = {
  title: "Add Subject | Vurra Secondary School",
  description: "Create a new subject",
}

export default async function AddSubjectPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Subject</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Creation</CardTitle>
          <CardDescription>Create a new subject in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectForm />
        </CardContent>
      </Card>
    </div>
  )
}
