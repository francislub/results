import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClassForm } from "@/components/classes/class-form"

export const metadata: Metadata = {
  title: "Add Class | Vurra Secondary School",
  description: "Create a new class",
}

export default async function AddClassPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  })

  const subjects = await prisma.subject.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Class</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Creation</CardTitle>
          <CardDescription>Create a new class in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassForm teachers={teachers} subjects={subjects} />
        </CardContent>
      </Card>
    </div>
  )
}
