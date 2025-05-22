import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Grading Systems | School Results Management",
  description: "Manage grading systems for student assessments",
}

export default async function GradingSystemsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only admin can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  let gradingSystems = []
  let error = null

  try {
    console.log("Attempting to fetch grading systems...")

    // Check if prisma is defined
    if (!prisma) {
      console.error("Prisma client is undefined")
      error = "Prisma client is undefined. Please check your database connection."
    } else {
      try {
        // Try to access the gradingSystem model safely
        gradingSystems = await prisma.gradingSystem.findMany({
          orderBy: {
            minScore: "desc",
          },
        })
        console.log(`Successfully fetched ${gradingSystems.length} grading systems`)
      } catch (modelError) {
        console.error("Error accessing gradingSystem model:", modelError)
        error = `Error accessing gradingSystem model: ${modelError.message}. Please ensure your Prisma schema includes the GradingSystem model and run 'npx prisma generate'.`
      }
    }
  } catch (e) {
    console.error("Error fetching grading systems:", e)
    error = `Error fetching grading systems: ${e.message}`
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grading Systems</h1>
          <p className="text-muted-foreground mt-1">Manage grading systems for student assessments</p>
        </div>
        <Button asChild>
          <Link href="/grading-systems/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Grade
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <strong>Troubleshooting steps:</strong>
              <ol className="list-decimal ml-5 mt-1">
                <li>Ensure your Prisma schema includes the GradingSystem model</li>
                <li>
                  Run <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">npx prisma generate</code> to
                  update the Prisma client
                </li>
                <li>
                  Run <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">npx prisma db push</code> to
                  update the database schema
                </li>
                <li>Restart your development server</li>
                <li>If using MongoDB, ensure your connection string is correct</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {gradingSystems.length === 0 && !error ? (
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No grading systems found</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first grading system.</p>
          <Button asChild>
            <Link href="/grading-systems/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Grade
            </Link>
          </Button>
        </div>
      ) : (
        !error && (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                    <th className="text-left py-3 px-4 font-medium">Grade</th>
                    <th className="text-left py-3 px-4 font-medium">Min Score</th>
                    <th className="text-left py-3 px-4 font-medium">Max Score</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingSystems.map((grade) => (
                    <tr key={grade.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="py-3 px-4 font-medium">{grade.grade}</td>
                      <td className="py-3 px-4">{grade.minScore}</td>
                      <td className="py-3 px-4">{grade.maxScore}</td>
                      <td className="py-3 px-4">{grade.description || "-"}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/grading-systems/${grade.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/grading-systems/${grade.id}/edit`}>Edit</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

    </div>
  )
}
