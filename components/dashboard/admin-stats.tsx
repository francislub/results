"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface AdminStatsProps {
  data: any
}

export function AdminStats({ data }: AdminStatsProps) {
  // Gender distribution data (mock data if not available)
  const genderData = [
    { name: "Male", value: 65 },
    { name: "Female", value: 35 },
  ]

  // Performance distribution data (mock data)
  const performanceData = [
    { name: "Excellent (A)", value: 15 },
    { name: "Very Good (B)", value: 30 },
    { name: "Good (C)", value: 25 },
    { name: "Fair (D)", value: 20 },
    { name: "Poor (F)", value: 10 },
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Student Distribution</CardTitle>
          <CardDescription>Distribution of students by gender</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
          <CardDescription>Distribution of grades across all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>Recently registered students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentStudents?.map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{student.user.name}</p>
                  <p className="text-xs text-muted-foreground">{student.registrationNo}</p>
                </div>
                <div className="text-sm">{student.class?.name || "No Class"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
