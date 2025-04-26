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

export type Student = {
  id: string
  name: string
  email: string
  registrationNo: string
  class: string
  gender: string
  parentName: string
  parentContact: string
}

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "registrationNo",
    header: "Registration No",
  },
  {
    accessorKey: "class",
    header: "Class",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "parentName",
    header: "Parent Name",
  },
  {
    accessorKey: "parentContact",
    header: "Parent Contact",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original

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
              <Link href={`/students/${student.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/students/${student.id}/edit`}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
