import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ScrollArea } from "@/components/ui/scroll-area"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 bg-background border-r">
        <Sidebar />
      </div>
      <div className="md:pl-64 flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1">
          <div className="container py-6">
            <ScrollArea className="h-[calc(100vh-4rem)]">{children}</ScrollArea>
          </div>
        </main>
      </div>
    </div>
  )
}
