import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SubjectForm } from "@/components/subjects/subject-form"

export const metadata: Metadata = {
  title: "Edit Subject | Vurra Secondary School",
  description: "Edit subject details",
}

export default async function EditSubjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const subject = await prisma.subject.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!subject) {
    redirect("/subjects")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Subject</h1>
      </div>

      <SubjectForm subject={subject} />
    </div>
  )
}
