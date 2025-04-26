"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  staffId: z.string().min(2, "Staff ID is required"),
  qualification: z.string().min(2, "Qualification is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  contact: z.string().min(2, "Contact is required"),
  address: z.string().optional(),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
})

interface TeacherFormProps {
  subjects: any[]
  teacher?: any
}

export function TeacherForm({ subjects, teacher }: TeacherFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher?.user?.name || "",
      email: teacher?.user?.email || "",
      password: "",
      staffId: teacher?.staffId || "",
      qualification: teacher?.qualification || "",
      gender: teacher?.gender || undefined,
      dateOfBirth: teacher?.dateOfBirth ? new Date(teacher.dateOfBirth) : undefined,
      contact: teacher?.contact || "",
      address: teacher?.address || "",
      subjects: teacher?.subjects?.map((s) => s.subjectId) || [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    try {
      const url = teacher ? `/api/teachers/${teacher.id}` : "/api/teachers"
      const method = teacher ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: teacher ? "Teacher updated" : "Teacher registered",
          description: teacher
            ? "The teacher has been updated successfully."
            : "The teacher has been registered successfully.",
        })
        router.push("/teachers")
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save teacher",
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
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{teacher ? "New Password" : "Password"}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={teacher ? "Enter new password (leave blank to keep current)" : "Enter password"}
                    {...field}
                    disabled={submitting}
                  />
                </FormControl>
                {teacher && <FormDescription>Leave blank to keep the current password</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter staff ID" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qualification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qualification</FormLabel>
                <FormControl>
                  <Input placeholder="Enter qualification" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                    disabled={submitting}
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="Male" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="Female" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Female</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="Other" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Other</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={submitting}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact number" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter address (optional)"
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

        <FormField
          control={form.control}
          name="subjects"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Subjects</FormLabel>
                <FormDescription>Select the subjects this teacher will teach</FormDescription>
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
            {teacher ? "Update Teacher" : "Register Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
