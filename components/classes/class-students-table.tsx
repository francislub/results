"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Search, Eye, UserMinus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ClassStudentsTableProps {
  students: any[]
  classId: string
}

export function ClassStudentsTable({ students, classId }: ClassStudentsTableProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState(students)
  const [isRemoving, setIsRemoving] = useState(false)
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (term === "") {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(
        (student) =>
          student.user.name.toLowerCase().includes(term) ||
          student.registrationNo.toLowerCase().includes(term) ||
          student.user.email.toLowerCase().includes(term),
      )
      setFilteredStudents(filtered)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const removeStudentFromClass = async (studentId: string) => {
    setIsRemoving(true)
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Student removed",
          description: "The student has been removed from this class.",
        })
        // Remove student from the list
        setFilteredStudents(filteredStudents.filter((student) => student.id !== studentId))
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to remove student from class",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
      setStudentToRemove(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Registration No.</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Parent Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(student.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.user.name}</div>
                        <div className="text-sm text-muted-foreground">{student.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.registrationNo}</TableCell>
                  <TableCell>{student.gender || "—"}</TableCell>
                  <TableCell>{student.parentContact || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/students/${student.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>

                      {session?.user.role === "ADMIN" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setStudentToRemove(student.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove student from class?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {student.user.name} from this class. The student account will not be
                                deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (studentToRemove) {
                                    removeStudentFromClass(studentToRemove)
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
