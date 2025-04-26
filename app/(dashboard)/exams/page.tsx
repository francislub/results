import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ExamCard } from "@/components/exams/exam-card"

export const metadata: Metadata = {
  title: "Exams | Vurra Secondary School",
  description: "Manage exams in Vurra Secondary School",
}

export default async function ExamsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const exams = await prisma.exam.findMany({
    include: {
      class: true,
      _count: {
        select: {
          marks: true,
        },
      },
    },
    orderBy: [
      {
        academicYear: "desc",
      },
      {
        term: "desc",
      },
      {
        startDate: "desc",
      },
    ],
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <Button asChild>
          <Link href="/exams/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Exam
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </div>
  )
}
