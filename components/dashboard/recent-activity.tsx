"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

interface RecentActivityProps {
  role: string
  data: any
}

export function RecentActivity({ role, data }: RecentActivityProps) {
  if (role === "ADMIN") {
    // Create activity items from recent students and exams
    const activities = [
      ...(data.recentStudents?.map((student) => ({
        id: student.id,
        user: student.user.name,
        action: `was registered in ${student.class?.name || "No Class"}`,
        date: student.createdAt,
        type: "student",
      })) || []),
      ...(data.recentExams?.map((exam) => ({
        id: exam.id,
        user: "Admin",
        action: `created exam ${exam.name} for ${exam.class.name}`,
        date: exam.createdAt,
        type: "exam",
      })) || []),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return (
      <div className="space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium">{activity.user}</p>
              <p className="text-sm text-muted-foreground">{activity.action}</p>
              <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
            </div>
          </div>
        ))}
      </div>
    )
  } else if (role === "TEACHER") {
    // Show recent marks entered by the teacher
    const activities =
      data.recentMarks?.map((mark) => ({
        id: mark.id,
        user: mark.student.user.name,
        action: `received ${mark.score}% in ${mark.subject.name} (${mark.exam.name})`,
        date: mark.createdAt,
      })) || []

    return (
      <div className="space-y-8">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">{activity.user}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No recent activities</p>
        )}
      </div>
    )
  } else {
    // Show student's recent marks
    const activities =
      data.marks?.slice(0, 5).map((mark) => ({
        id: mark.id,
        subject: mark.subject.name,
        action: `You scored ${mark.score}% in ${mark.exam.name}`,
        date: mark.createdAt,
        grade: mark.grade,
      })) || []

    return (
      <div className="space-y-8">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{activity.subject.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">{activity.subject}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No recent activities</p>
        )}
      </div>
    )
  }
}
