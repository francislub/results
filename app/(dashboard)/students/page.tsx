import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/students/data-table"
import { columns } from "@/components/students/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "Students | Vurra Secondary School",
  description: "Manage students in Vurra Secondary School",
}

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const students = await prisma.student.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      class: {
        select: {
          name: true,
        },
      },
    },
  })

  const formattedStudents = students.map((student) => ({
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    registrationNo: student.registrationNo,
    class: student.class?.name || "Not Assigned",
    gender: student.gender || "Not Specified",
    parentName: student.parentName || "Not Specified",
    parentContact: student.parentContact || "Not Specified",
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <Button asChild>
          <Link href="/students/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={formattedStudents} />
    </div>
  )
}
