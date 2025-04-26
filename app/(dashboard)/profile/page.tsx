import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/profile-form"
import { Separator } from "@/components/ui/separator"
import { PasswordChangeForm } from "@/components/profile/password-change-form"

export const metadata: Metadata = {
  title: "Profile | Vurra Secondary School",
  description: "Manage your profile",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  let userData = null

  if (session.user.role === "ADMIN") {
    userData = await prisma.admin.findUnique({
      where: {
        id: session.user.adminId,
      },
      include: {
        user: true,
      },
    })
  } else if (session.user.role === "TEACHER") {
    userData = await prisma.teacher.findUnique({
      where: {
        id: session.user.teacherId,
      },
      include: {
        user: true,
      },
    })
  } else if (session.user.role === "STUDENT") {
    userData = await prisma.student.findUnique({
      where: {
        id: session.user.studentId,
      },
      include: {
        user: true,
        class: true,
      },
    })
  }

  if (!userData) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm userData={userData} userRole={session.user.role} />
        </CardContent>
      </Card>

      <Separator className="my-4" />

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
