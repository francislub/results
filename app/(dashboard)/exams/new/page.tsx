import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExamForm } from "@/components/exams/exam-form"

export const metadata: Metadata = {
  title: "Add Exam | Vurra Secondary School",
  description: "Create a new examination",
}

export default async function AddExamPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Add Exam</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Creation</CardTitle>
          <CardDescription>Create a new examination in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <ExamForm classes={classes} />
        </CardContent>
      </Card>
    </div>
  )
}
