"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  School,
  Settings,
  Users,
  FileText,
  User,
  CalendarDays,
  Award,
  ClipboardList,
  Layers,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role

  const adminRoutes = [
    {
      icon: LayoutDashboard,
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: Users,
      href: "/students",
      label: "Students",
    },
    {
      icon: GraduationCap,
      href: "/teachers",
      label: "Teachers",
    },
    {
      icon: School,
      href: "/classes",
      label: "Classes",
    },
    {
      icon: BookOpen,
      href: "/subjects",
      label: "Subjects",
    },
    {
      icon: CalendarDays,
      href: "/exams",
      label: "Exams",
    },
    {
      icon: CalendarDays,
      href: "/grading-systems",
      label: "Grading Systems",
    },
    {
      icon: BarChart3,
      href: "/reports",
      label: "Reports",
    },
    {
      icon: Settings,
      href: "/settings",
      label: "Settings",
    },
  ]

  const teacherRoutes = [
    {
      icon: LayoutDashboard,
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: School,
      href: "/my-classes",
      label: "My Classes",
    },
    {
      icon: BookOpen,
      href: "/my-subjects",
      label: "My Subjects",
    },
    {
      icon: ClipboardList,
      href: "/marks",
      label: "Marks",
    },
    {
      icon: BarChart3,
      href: "/reports",
      label: "Reports",
    },
    {
      icon: User,
      href: "/profile",
      label: "Profile",
    },
  ]

  const studentRoutes = [
    {
      icon: LayoutDashboard,
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: Award,
      href: "/my-results",
      label: "My Results",
    },
    {
      icon: FileText,
      href: "/reports",
      label: "Reports",
    },
    {
      icon: User,
      href: "/profile",
      label: "Profile",
    },
  ]

  let routes = studentRoutes
  let sidebarBgClass = "bg-gradient-to-b from-emerald-50 to-teal-100"
  let activeButtonClass = "bg-emerald-600 text-white hover:bg-emerald-700"
  let logoColor = "text-emerald-600"

  if (role === "ADMIN") {
    routes = adminRoutes
    sidebarBgClass = "bg-gradient-to-b from-indigo-50 to-purple-100"
    activeButtonClass = "bg-indigo-600 text-white hover:bg-indigo-700"
    logoColor = "text-indigo-600"
  } else if (role === "TEACHER") {
    routes = teacherRoutes
    sidebarBgClass = "bg-gradient-to-b from-amber-50 to-orange-100"
    activeButtonClass = "bg-amber-600 text-white hover:bg-amber-700"
    logoColor = "text-amber-600"
  }

  return (
    <div className={cn(`pb-12 h-screen border-r border-border ${sidebarBgClass}`, className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="flex items-center justify-center mb-6">
            <School className={`h-8 w-8 ${logoColor}`} />
            <h2 className="ml-2 text-lg font-semibold tracking-tight">Vurra Secondary</h2>
          </div>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === route.href ? activeButtonClass : "hover:bg-white/50",
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
