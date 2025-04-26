"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"

interface OverviewProps {
  role: string
  data: any
}

export function Overview({ role, data }: OverviewProps) {
  if (role === "ADMIN") {
    // Create data for class distribution
    const classData =
      data.classCounts?.map((c) => ({
        name: c.name,
        students: c._count.students,
      })) || []

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={classData}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => [`${value} students`, "Count"]}
            labelFormatter={(label) => `Class: ${label}`}
          />
          <Legend />
          <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  } else if (role === "TEACHER") {
    // Create data for subject distribution
    const subjectData =
      data.subjects?.map((s) => ({
        name: s.subject.name,
        code: s.subject.code,
      })) || []

    // Create mock performance data for teacher's subjects
    const performanceData = [
      { name: "Math", average: 72 },
      { name: "English", average: 65 },
      { name: "Science", average: 59 },
      { name: "History", average: 81 },
    ]

    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
          <Legend />
          <Line type="monotone" dataKey="average" name="Class Average (%)" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    )
  } else {
    // Student view - show performance across exams
    const examData = data.marks?.reduce((acc, mark) => {
      const examName = `${mark.exam.name} (${mark.exam.term})`
      if (!acc[examName]) {
        acc[examName] = {
          name: examName,
          scores: [],
        }
      }
      acc[examName].scores.push(mark.score)
      return acc
    }, {})

    const chartData = Object.values(examData || {}).map((item: any) => ({
      name: item.name,
      score: item.scores.reduce((sum, score) => sum + score, 0) / item.scores.length,
    }))

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 100]}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Average Score"]} />
          <Bar dataKey="score" name="Average Score" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }
}
