import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { GradingForm } from "@/components/grading-systems/grading-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"
import prisma from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Edit Grading System | School Results Management",
  description: "Edit an existing grading system",
}

export default async function EditGradingSystemPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only admin can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const gradingSystem = await prisma.gradingSystem.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!gradingSystem) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <HomeIcon className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/grading-systems">Grading Systems</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/grading-systems/${params.id}`}>Grade {gradingSystem.grade}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-3xl mx-auto">
        <GradingForm initialData={gradingSystem} isEditing={true} />
      </div>
    </div>
  )
}
