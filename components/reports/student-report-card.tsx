"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface StudentReportCardProps {
  data: any
}

export function StudentReportCard({ data }: StudentReportCardProps) {
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

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">VURRA SECONDARY SCHOOL</h1>
        <h2 className="text-xl">STUDENT REPORT CARD</h2>
        <p className="text-muted-foreground">Arua City, Uganda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4">
        <div>
          <p className="text-sm font-medium">Student Name:</p>
          <p className="text-sm">{data.student.user.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Registration Number:</p>
          <p className="text-sm">{data.student.registrationNo}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Class:</p>
          <p className="text-sm">{data.student.class?.name || "Not Assigned"}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Class Teacher:</p>
          <p className="text-sm">{data.student.class?.teacher?.user?.name || "Not Assigned"}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Academic Year:</p>
          <p className="text-sm">{data.student.class?.academicYear || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Term:</p>
          <p className="text-sm">{data.student.class?.term || "N/A"}</p>
        </div>
      </div>

      {data.examGroups.map((group, index) => (
        <Card key={index} className="mt-4">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{group.exam.name}</h3>
              <p className="text-sm text-muted-foreground">
                {group.exam.term} - {group.exam.academicYear} | {formatDate(group.exam.startDate)} to{" "}
                {formatDate(group.exam.endDate)}
              </p>
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
                {group.subjects.map((subject, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{subject.subject.name}</TableCell>
                    <TableCell>{subject.score.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getGradeColor(subject.grade)}>{subject.grade}</Badge>
                    </TableCell>
                    <TableCell>{subject.comment || "No comment"}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Average</TableCell>
                  <TableCell className="font-bold">{group.averageScore.toFixed(2)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <div className="mt-6 border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">Overall Average:</p>
            <p className="text-lg font-bold">{data.overallAverage.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Exams:</p>
            <p className="text-lg font-bold">{data.totalExams}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Subjects:</p>
            <p className="text-lg font-bold">{data.totalSubjects}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <p className="font-medium">Class Teacher's Comment:</p>
          <div className="border-b border-dashed h-16"></div>
          <p className="text-sm">Signature & Date</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Principal's Comment:</p>
          <div className="border-b border-dashed h-16"></div>
          <p className="text-sm">Signature & Date</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Parent's Comment:</p>
          <div className="border-b border-dashed h-16"></div>
          <p className="text-sm">Signature & Date</p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>This report card was generated on {formatDate(new Date())}</p>
        <p>Vurra Secondary School - Excellence in Education</p>
      </div>
    </div>
  )
}
