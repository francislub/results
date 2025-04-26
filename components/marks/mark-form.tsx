"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { calculateGrade } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  examId: z.string().min(1, "Exam is required"),
  score: z.coerce.number().min(0, "Score must be at least 0").max(100, "Score must be at most 100"),
  comment: z.string().optional(),
})

interface MarkFormProps {
  classes: any[]
  subjects: any[]
  exams: any[]
  gradingSystem: any[]
  mark?: any
}

export function MarkForm({ classes, subjects, exams, gradingSystem, mark }: MarkFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [grade, setGrade] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: mark?.student?.classId || "",
      studentId: mark?.studentId || "",
      subjectId: mark?.subjectId || "",
      examId: mark?.examId || "",
      score: mark?.score || "",
      comment: mark?.comment || "",
    },
  })

  const watchClassId = form.watch("classId")
  const watchScore = form.watch("score")

  // Fetch students when class changes
  useEffect(() => {
    if (watchClassId) {
      fetchStudents(watchClassId)
    }
  }, [watchClassId])

  // Calculate grade when score changes
  useEffect(() => {
    if (watchScore !== undefined && watchScore !== null && watchScore !== "") {
      const calculatedGrade = calculateGrade(Number(watchScore), gradingSystem)
      setGrade(calculatedGrade)
    } else {
      setGrade("")
    }
  }, [watchScore, gradingSystem])

  const fetchStudents = async (classId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/classes/${classId}/students`)
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    try {
      const url = mark ? `/api/marks/${mark.id}` : "/api/marks"
      const method = mark ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: mark ? "Mark updated" : "Mark added",
          description: mark ? "The mark has been updated successfully." : "The mark has been added successfully.",
        })
        router.push("/marks")
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save mark",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!watchClassId || loading || submitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      {loading ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading students...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select student" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user.name} ({student.registrationNo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="examId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} ({exam.term} - {exam.academicYear})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Score (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter score"
                    {...field}
                    disabled={submitting}
                  />
                </FormControl>
                <FormDescription>
                  Grade: <strong>{grade}</strong>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comment (optional)"
                    className="resize-none"
                    {...field}
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mark ? "Update Mark" : "Add Mark"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
