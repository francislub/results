import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/subjects/data-table"
import { columns } from "@/components/subjects/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "Subjects | Vurra Secondary School",
  description: "Manage subjects in Vurra Secondary School",
}

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const subjects = await prisma.subject.findMany({
    include: {
      teachers: {
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      classes: {
        include: {
          class: true,
        },
      },
      _count: {
        select: {
          marks: true,
        },
      },
    },
  })

  const formattedSubjects = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    code: subject.code,
    description: subject.description || "No description",
    teachers: subject.teachers.map((t) => t.teacher.user.name).join(", ") || "None",
    classes: subject.classes.map((c) => c.class.name).join(", ") || "None",
    marksCount: subject._count.marks,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <Button asChild>
          <Link href="/subjects/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={formattedSubjects} />
    </div>
  )
}
