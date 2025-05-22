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

export type Teacher = {
  id: string
  name: string
  email: string
  staffId: string
  qualification: string
  gender: string
  contact: string
  subjects: string
  classes: string
}

export const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "staffId",
    header: "Staff ID",
  },
  {
    accessorKey: "qualification",
    header: "Qualification",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "subjects",
    header: "Subjects",
  },
  {
    accessorKey: "classes",
    header: "Classes",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teacher = row.original

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
            {/* <DropdownMenuItem asChild>
              <Link href={`/teachers/${teacher.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem asChild>
              <Link href={`/teachers/${teacher.id}/edit`}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem> */}
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
