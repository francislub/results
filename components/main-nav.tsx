"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

  const adminRoutes = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/students", label: "Students" },
    { href: "/teachers", label: "Teachers" },
    { href: "/classes", label: "Classes" },
    { href: "/subjects", label: "Subjects" },
    { href: "/exams", label: "Exams" },
    { href: "/reports", label: "Reports" },
    { href: "/settings", label: "Settings" },
  ]

  const teacherRoutes = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/my-classes", label: "My Classes" },
    { href: "/my-subjects", label: "My Subjects" },
    { href: "/marks", label: "Marks" },
    { href: "/reports", label: "Reports" },
  ]

  const studentRoutes = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/my-results", label: "My Results" },
    { href: "/profile", label: "Profile" },
  ]

  let routes = studentRoutes

  if (role === "ADMIN") {
    routes = adminRoutes
  } else if (role === "TEACHER") {
    routes = teacherRoutes
  }

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === route.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
