"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileEdit, Trash, Eye } from "lucide-react"
import Link from "next/link"

export type Subject = {
  id: string
  name: string
  code: string
  description: string
  teachers: string
  classes: string
  marksCount: number
}

export const columns: ColumnDef<Subject>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "teachers",
    header: "Teachers",
  },
  {
    accessorKey: "classes",
    header: "Classes",
  },
  {
    accessorKey: "marksCount",
    header: "Marks",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const subject = row.original

      return (
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
            <DropdownMenuItem asChild>
              <Link href={`/subjects/${subject.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/subjects/${subject.id}/edit`}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" asChild>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
                    fetch(`/api/subjects/${subject.id}`, {
                      method: "DELETE",
                    })
                      .then((response) => {
                        if (response.ok) {
                          window.location.reload()
                        } else {
                          response.json().then((data) => {
                            alert(data.error || "Failed to delete subject")
                          })
                        }
                      })
                      .catch((error) => {
                        alert("An unexpected error occurred")
                      })
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
