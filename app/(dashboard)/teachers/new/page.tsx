import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeacherForm } from "@/components/teachers/teacher-form"

export const metadata: Metadata = {
  title: "Add Teacher | Vurra Secondary School",
  description: "Register a new teacher",
}

export default async function AddTeacherPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const subjects = await prisma.subject.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Teacher</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Registration</CardTitle>
          <CardDescription>Register a new teacher in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherForm subjects={subjects} />
        </CardContent>
      </Card>
    </div>
  )
}
