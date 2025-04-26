declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
    studentId: string | null
    teacherId: string | null
    adminId: string | null
  }

  interface Session {
    user: User & {
      id: string
      role: string
      studentId: string | null
      teacherId: string | null
      adminId: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    studentId: string | null
    teacherId: string | null
    adminId: string | null
  }
}
