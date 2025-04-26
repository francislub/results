"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatDate } from "@/lib/utils"

interface StudentStatsProps {
  data: any
}

export function StudentStats({ data }: StudentStatsProps) {
  // Prepare performance trend data
  const performanceTrend = data.marks?.reduce((acc, mark) => {
    const examName = `${mark.exam.name} (${mark.exam.term})`
    if (!acc[examName]) {
      acc[examName] = {
        name: examName,
        date: mark.exam.startDate,
        scores: [],
      }
    }
    acc[examName].scores.push(mark.score)
    return acc
  }, {})

  const trendData = Object.values(performanceTrend || {})
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item: any) => ({
      name: item.name,
      average: item.scores.reduce((sum, score) => sum + score, 0) / item.scores.length,
    }))

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Your performance trend across exams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Average Score"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Average Score (%)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Exams</CardTitle>
          <CardDescription>Your upcoming examinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.exams
              ?.filter((exam) => new Date(exam.startDate) > new Date())
              .slice(0, 5)
              .map((exam) => (
                <div key={exam.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{exam.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(exam.startDate)}</p>
                  </div>
                  <Badge variant="outline">{exam.term}</Badge>
                </div>
              ))}
            {data.exams?.filter((exam) => new Date(exam.startDate) > new Date()).length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming exams</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Your performance in different subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.marks?.reduce((subjects, mark) => {
              if (!subjects[mark.subjectId]) {
                subjects[mark.subjectId] = {
                  id: mark.subjectId,
                  name: mark.subject.name,
                  scores: [],
                }
              }
              subjects[mark.subjectId].scores.push(mark.score)
              return subjects
            }, {}) &&
              Object.values(
                data.marks?.reduce((subjects, mark) => {
                  if (!subjects[mark.subjectId]) {
                    subjects[mark.subjectId] = {
                      id: mark.subjectId,
                      name: mark.subject.name,
                      scores: [],
                    }
                  }
                  subjects[mark.subjectId].scores.push(mark.score)
                  return subjects
                }, {}),
              ).map((subject: any) => {
                const average = subject.scores.reduce((sum, score) => sum + score, 0) / subject.scores.length
                return (
                  <div key={subject.id} className="flex flex-col p-4 border rounded-lg">
                    <h3 className="text-lg font-medium">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">Average: {average.toFixed(2)}%</p>
                    <Badge
                      className="mt-2 self-start"
                      variant={average >= 70 ? "default" : average >= 50 ? "secondary" : "destructive"}
                    >
                      {average >= 70 ? "Excellent" : average >= 50 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>Your most recent exam results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.marks?.slice(0, 5).map((mark) => (
              <div key={mark.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{mark.subject.name}</p>
                  <p className="text-xs text-muted-foreground">{mark.exam.name}</p>
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
