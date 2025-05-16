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

  // Teacher-specific colors - orange theme
  const chartColor = "#f59e0b"
  const cardBgClass = "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
  const titleClass = "text-amber-900"
  const descriptionClass = "text-amber-700"

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className={`col-span-1 lg:col-span-2 ${cardBgClass}`}>
        <CardHeader>
          <CardTitle className={titleClass}>Class Performance</CardTitle>
          <CardDescription className={descriptionClass}>Average performance in your classes</CardDescription>
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
                <Bar dataKey="average" name="Class Average (%)" fill={chartColor} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className={cardBgClass}>
        <CardHeader>
          <CardTitle className={titleClass}>My Classes</CardTitle>
          <CardDescription className={descriptionClass}>Classes you are teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.classes?.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm">
                <div>
                  <p className="text-sm font-medium text-amber-900">{classItem.name}</p>
                  <p className="text-xs text-amber-600">{classItem._count.students} students</p>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  Class Teacher
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={`col-span-1 lg:col-span-2 ${cardBgClass}`}>
        <CardHeader>
          <CardTitle className={titleClass}>My Subjects</CardTitle>
          <CardDescription className={descriptionClass}>Subjects you are teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.subjects?.map((subjectTeacher) => (
              <div key={subjectTeacher.id} className="flex flex-col p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-medium text-amber-900">{subjectTeacher.subject.name}</h3>
                <p className="text-sm text-amber-600">Code: {subjectTeacher.subject.code}</p>
                <p className="text-sm mt-2 text-amber-800">{subjectTeacher.subject.description || "No description"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={cardBgClass}>
        <CardHeader>
          <CardTitle className={titleClass}>Recent Marks</CardTitle>
          <CardDescription className={descriptionClass}>Recently recorded marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentMarks?.slice(0, 5).map((mark) => (
              <div key={mark.id} className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm">
                <div>
                  <p className="text-sm font-medium text-amber-900">{mark.student.user.name}</p>
                  <p className="text-xs text-amber-600">{mark.subject.name}</p>
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
