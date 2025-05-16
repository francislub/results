import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { School, Users, BookOpen, GraduationCap, Edit } from "lucide-react"
import Link from "next/link"

interface ClassCardProps {
  classItem: any
}

export function ClassCard({ classItem }: ClassCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{classItem.name}</CardTitle>
          <School className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>
          Level: {classItem.level} | {classItem.academicYear} - {classItem.term}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Class Teacher: {classItem.teacher?.user?.name || "Not Assigned"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Students: {classItem._count.students}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Subjects: {classItem._count.subjects}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/classes/${classItem.id}`}>View Details</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/classes/${classItem.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/classes/${classItem.id}/students`}>Students</Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
