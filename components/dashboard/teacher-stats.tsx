"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TeacherStatsProps {
  data: any
}

export function TeacherStats({ data }: TeacherStatsProps) {
  // Mock data for class performance
  const classPerformanceData = [
    { name: "S1 Math", average: 72 },
    { name: "S2 Math", average: 68 },
    { name: "S3 Science", average: 75 },
    { name: "S4 Science", average: 65 },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Class Performance</CardTitle>
          <CardDescription>Average performance in your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
                <Legend />
                <Bar dataKey="average" name="Class Average (%)" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Classes you are teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.classes?.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{classItem.name}</p>
                  <p className="text-xs text-muted-foreground">{classItem._count.students} students</p>
                </div>
                <Badge variant="outline">Class Teacher</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>My Subjects</CardTitle>
          <CardDescription>Subjects you are teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.subjects?.map((subjectTeacher) => (
              <div key={subjectTeacher.id} className="flex flex-col p-4 border rounded-lg">
                <h3 className="text-lg font-medium">{subjectTeacher.subject.name}</h3>
                <p className="text-sm text-muted-foreground">Code: {subjectTeacher.subject.code}</p>
                <p className="text-sm mt-2">{subjectTeacher.subject.description || "No description"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Marks</CardTitle>
          <CardDescription>Recently recorded marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentMarks?.slice(0, 5).map((mark) => (
              <div key={mark.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{mark.student.user.name}</p>
                  <p className="text-xs text-muted-foreground">{mark.subject.name}</p>
                </div>
                <Badge variant={mark.score >= 70 ? "default" : mark.score >= 50 ? "secondary" : "destructive"}>
                  {mark.score}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
