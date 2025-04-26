"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  level: z.coerce.number().min(1, "Level must be at least 1"),
  academicYear: z.string().min(2, "Academic year is required"),
  term: z.string().min(2, "Term is required"),
  teacherId: z.string().optional(),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
})

interface ClassFormProps {
  teachers: any[]
  subjects: any[]
  classItem?: any
}

export function ClassForm({ teachers, subjects, classItem }: ClassFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: classItem?.name || "",
      level: classItem?.level || "",
      academicYear: classItem?.academicYear || "",
      term: classItem?.term || "",
      teacherId: classItem?.teacherId || "",
      subjects: classItem?.subjects?.map((s) => s.subjectId) || [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    try {
      const url = classItem ? `/api/classes/${classItem.id}` : "/api/classes"
      const method = classItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: classItem ? "Class updated" : "Class created",
          description: classItem
            ? "The class has been updated successfully."
            : "The class has been created successfully.",
        })
        router.push("/classes")
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save class",
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter class name (e.g. S1A)" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter level (e.g. 1 for S1)" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      `${new Date().getFullYear() - 1}/${new Date().getFullYear()}`,
                      `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
                      `${new Date().getFullYear() + 1}/${new Date().getFullYear() + 2}`,
                    ].map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
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
            name="term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Term 1", "Term 2", "Term 3"].map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
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
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Teacher</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={submitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class teacher (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user.name} ({teacher.staffId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The teacher who will be responsible for this class</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subjects"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Subjects</FormLabel>
                <FormDescription>Select the subjects that will be taught in this class</FormDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {subjects.map((subject) => (
                  <FormField
                    key={subject.id}
                    control={form.control}
                    name="subjects"
                    render={({ field }) => {
                      return (
                        <FormItem key={subject.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(subject.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, subject.id])
                                  : field.onChange(field.value?.filter((value) => value !== subject.id))
                              }}
                              disabled={submitting}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {subject.name} ({subject.code})
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {classItem ? "Update Class" : "Create Class"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
