import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/teachers/data-table"
import { columns } from "@/components/teachers/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "Teachers | Vurra Secondary School",
  description: "Manage teachers in Vurra Secondary School",
}

export default async function TeachersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      subjects: {
        include: {
          subject: true,
        },
      },
      classTeacher: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  const formattedTeachers = teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.user.name,
    email: teacher.user.email,
    staffId: teacher.staffId,
    qualification: teacher.qualification || "Not Specified",
    gender: teacher.gender || "Not Specified",
    contact: teacher.contact || "Not Specified",
    subjects: teacher.subjects.map((s) => s.subject.name).join(", ") || "None",
    classes: teacher.classTeacher.map((c) => c.name).join(", ") || "None",
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <Button asChild>
          <Link href="/teachers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={formattedTeachers} />
    </div>
  )
}
