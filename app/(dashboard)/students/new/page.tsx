import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentForm } from "@/components/students/student-form"

export const metadata: Metadata = {
  title: "Add Student | Vurra Secondary School",
  description: "Register a new student",
}

export default async function AddStudentPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const classes = await prisma.class.findMany({
    orderBy: [
      {
        level: "asc",
      },
      {
        name: "asc",
      },
    ],
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Student</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>Register a new student in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentForm classes={classes} />
        </CardContent>
      </Card>
    </div>
  )
}
