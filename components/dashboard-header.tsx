"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Menu } from "lucide-react"
import { useSession } from "next-auth/react"

export function DashboardHeader() {
  const { data: session } = useSession()
  const role = session?.user?.role

  let title = "Student Dashboard"
  if (role === "ADMIN") {
    title = "Admin Dashboard"
  } else if (role === "TEACHER") {
    title = "Teacher Dashboard"
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
