"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileEdit, Trash, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MarksTableProps {
  marks: any[]
}

export function MarksTable({ marks }: MarksTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [markToDelete, setMarkToDelete] = useState(null)

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500 text-white"
      case "B":
        return "bg-blue-500 text-white"
      case "C":
        return "bg-yellow-500 text-white"
      case "D":
        return "bg-orange-500 text-white"
      case "E":
      case "F":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleDelete = async () => {
    if (!markToDelete) return

    try {
      const response = await fetch(`/api/marks/${markToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Mark deleted",
          description: "The mark has been deleted successfully.",
        })
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete mark",
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
      setIsDeleteDialogOpen(false)
      setMarkToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marks.length > 0 ? (
              marks.map((mark) => (
                <TableRow key={mark.id}>
                  <TableCell className="font-medium">{mark.student.user.name}</TableCell>
                  <TableCell>{mark.student.class?.name || "N/A"}</TableCell>
                  <TableCell>{mark.subject.name}</TableCell>
                  <TableCell>
                    {mark.exam.name} ({mark.exam.term})
                  </TableCell>
                  <TableCell>{mark.score.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Badge className={getGradeColor(mark.grade)}>{mark.grade}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(mark.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/marks/${mark.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/marks/${mark.id}/edit`)}>
                          <FileEdit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setMarkToDelete(mark.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No marks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the mark record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
