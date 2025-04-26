"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ClassReportViewProps {
  data: any
}

export function ClassReportView({ data }: ClassReportViewProps) {
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

  // Prepare data for subject performance chart
  const subjectPerformanceData = data.subjectAverages.map((subject) => ({
    name: subject.subject.name,
    average: Number.parseFloat(subject.overallAverage.toFixed(2)),
  }))

  // Prepare data for student performance chart
  const studentPerformanceData = data.studentResults
    .sort((a, b) => b.overallAverage - a.overallAverage)
    .slice(0, 10)
    .map((student) => ({
      name: student.student.user.name,
      average: Number.parseFloat(student.overallAverage.toFixed(2)),
    }))

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">VURRA SECONDARY SCHOOL</h1>
        <h2 className="text-xl">CLASS PERFORMANCE REPORT</h2>
        <p className="text-muted-foreground">Arua City, Uganda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4">
        <div>
          <p className="text-sm font-medium">Class:</p>
          <p className="text-sm">{data.class.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Class Teacher:</p>
          <p className="text-sm">{data.class.teacher?.user?.name || "Not Assigned"}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Academic Year:</p>
          <p className="text-sm">{data.class.academicYear}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Term:</p>
          <p className="text-sm">{data.class.term}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Total Students:</p>
          <p className="text-sm">{data.studentResults.length}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Class Average:</p>
          <p className="text-sm">{data.classAverage.toFixed(2)}%</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
                    <Legend />
                    <Bar dataKey="average" name="Subject Average (%)" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Top Performing Students</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
                    <Legend />
                    <Bar dataKey="average" name="Student Average (%)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Average Score (%)</TableHead>
                    <TableHead>Highest Score (%)</TableHead>
                    <TableHead>Lowest Score (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.subjectAverages.map((subject, idx) => {
                    const scores = Object.values(subject.examAverages).flatMap((exam: any) => exam.scores)
                    const highestScore = scores.length > 0 ? Math.max(...scores) : 0
                    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{subject.subject.name}</TableCell>
                        <TableCell>{subject.subject.code}</TableCell>
                        <TableCell>{subject.overallAverage.toFixed(2)}%</TableCell>
                        <TableCell>{highestScore.toFixed(2)}%</TableCell>
                        <TableCell>{lowestScore.toFixed(2)}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Student Performance</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Registration No</TableHead>
                    <TableHead>Average Score (%)</TableHead>
                    <TableHead>Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.studentResults
                    .sort((a, b) => b.overallAverage - a.overallAverage)
                    .map((student, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{student.student.user.name}</TableCell>
                        <TableCell>{student.student.registrationNo}</TableCell>
                        <TableCell>{student.overallAverage.toFixed(2)}%</TableCell>
                        <TableCell>{idx + 1}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>This report was generated on {formatDate(new Date())}</p>
        <p>Vurra Secondary School - Excellence in Education</p>
      </div>
    </div>
  )
}
