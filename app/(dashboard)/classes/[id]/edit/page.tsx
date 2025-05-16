import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClassForm } from "@/components/classes/class-form"

export const metadata: Metadata = {
  title: "Edit Class | Vurra Secondary School",
  description: "Edit class details",
}

export default async function EditClassPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const classItem = await prisma.class.findUnique({
    where: {
      id: params.id,
    },
    include: {
      subjects: true,
    },
  })

  if (!classItem) {
    redirect("/classes")
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

  // Format class data for the form
  const formattedClass = {
    ...classItem,
    subjects: classItem.subjects.map((s) => s.subjectId),
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Class</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
          <CardDescription>Update class information</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassForm teachers={teachers} subjects={subjects} classItem={formattedClass} />
        </CardContent>
      </Card>
    </div>
  )
}
