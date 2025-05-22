import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DeleteGradingButton } from "@/components/grading-systems/delete-grading-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeIcon, PencilIcon } from "lucide-react"
import {prisma} from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Grading System Details | School Results Management",
  description: "View grading system details",
}

export default async function GradingSystemPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
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
            <BreadcrumbPage>Grade {gradingSystem.grade}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Grade {gradingSystem.grade}</CardTitle>
              <CardDescription>
                Score Range: {gradingSystem.minScore.toFixed(1)} - {gradingSystem.maxScore.toFixed(1)}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/grading-systems/${gradingSystem.id}/edit`}>
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <DeleteGradingButton id={gradingSystem.id} grade={gradingSystem.grade} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Grade</h3>
                <p className="mt-1 text-lg">{gradingSystem.grade}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Score Range</h3>
                <p className="mt-1 text-lg">
                  {gradingSystem.minScore.toFixed(1)} - {gradingSystem.maxScore.toFixed(1)}
                </p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{gradingSystem.description || "No description provided."}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">{formatDate(gradingSystem.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="mt-1">{formatDate(gradingSystem.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 flex justify-between">
            <Button asChild variant="outline">
              <Link href="/grading-systems">Back to Grading Systems</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
