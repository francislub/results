import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ClassCard } from "@/components/classes/class-card"

export const metadata: Metadata = {
  title: "Classes | Vurra Secondary School",
  description: "Manage classes in Vurra Secondary School",
}

export default async function ClassesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const classes = await prisma.class.findMany({
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
      _count: {
        select: {
          students: true,
          subjects: true,
        },
      },
    },
    orderBy: {
      level: "asc",
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <Button asChild>
          <Link href="/classes/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <ClassCard key={classItem.id} classItem={classItem} />
        ))}
      </div>
    </div>
  )
}
