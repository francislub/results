"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { calculateAverage } from "@/lib/utils"

interface ResultsTableProps {
  marks: any[]
}

export function ResultsTable({ marks }: ResultsTableProps) {
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

  const averageScore = calculateAverage(marks.map((mark) => mark.score))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Total Subjects: {marks.length}</p>
        </div>
        <div>
          <p className="text-sm font-medium">
            Average Score: <span className="font-bold">{averageScore.toFixed(2)}%</span>
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Score (%)</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {marks.length > 0 ? (
            marks.map((mark) => (
              <TableRow key={mark.id}>
                <TableCell className="font-medium">{mark.subject.name}</TableCell>
                <TableCell>{mark.score.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getGradeColor(mark.grade)}>{mark.grade}</Badge>
                </TableCell>
                <TableCell>{mark.comment || "No comment"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No results available for this exam.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
