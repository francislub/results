"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { calculateAverage } from "@/lib/utils"

interface PerformanceChartProps {
  marks: any[]
}

export function PerformanceChart({ marks }: PerformanceChartProps) {
  // Group marks by exam
  const examGroups = marks.reduce((groups, mark) => {
    const examId = mark.examId
    const examName = `${mark.exam.name} (${mark.exam.term})`

    if (!groups[examId]) {
      groups[examId] = {
        name: examName,
        scores: [],
        average: 0,
      }
    }

    groups[examId].scores.push(mark.score)
    return groups
  }, {})

  // Calculate averages
  Object.keys(examGroups).forEach((examId) => {
    examGroups[examId].average = calculateAverage(examGroups[examId].scores)
  })

  // Prepare chart data
  const chartData = Object.values(examGroups).map((group: any) => ({
    name: group.name,
    average: Number.parseFloat(group.average.toFixed(2)),
  }))

  // Group marks by subject
  const subjectGroups = marks.reduce((groups, mark) => {
    const subjectId = mark.subjectId
    const subjectName = mark.subject.name

    if (!groups[subjectId]) {
      groups[subjectId] = {
        name: subjectName,
        scores: [],
        average: 0,
      }
    }

    groups[subjectId].scores.push(mark.score)
    return groups
  }, {})

  // Calculate averages
  Object.keys(subjectGroups).forEach((subjectId) => {
    subjectGroups[subjectId].average = calculateAverage(subjectGroups[subjectId].scores)
  })

  // Prepare subject chart data
  const subjectChartData = Object.values(subjectGroups).map((group: any) => ({
    name: group.name,
    average: Number.parseFloat(group.average.toFixed(2)),
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Performance by Exam</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
            <Legend />
            <Bar dataKey="average" name="Average Score (%)" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Performance by Subject</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
            <Legend />
            <Bar dataKey="average" name="Average Score (%)" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
