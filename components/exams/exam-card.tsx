import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, FileText, School } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface ExamCardProps {
  exam: any
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{exam.name}</CardTitle>
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>
          {exam.academicYear} - {exam.term}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Class: {exam.class.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {formatDate(exam.startDate)} to {formatDate(exam.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{exam._count.marks} Marks Recorded</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/exams/${exam.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/exams/${exam.id}/marks`}>Manage Marks</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
