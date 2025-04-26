"use client"

import { useState } from "react"
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
import { Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  registrationNo: z.string().min(2, "Registration number is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  parentName: z.string().min(2, "Parent name is required"),
  parentContact: z.string().min(2, "Parent contact is required"),
  address: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
})

interface StudentFormProps {
  classes: any[]
  student?: any
}

export function StudentForm({ classes, student }: StudentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student?.user?.name || "",
      email: student?.user?.email || "",
      password: "",
      registrationNo: student?.registrationNo || "",
      gender: student?.gender || undefined,
      dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth) : undefined,
      parentName: student?.parentName || "",
      parentContact: student?.parentContact || "",
      address: student?.address || "",
      classId: student?.classId || "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    try {
      const url = student ? `/api/students/${student.id}` : "/api/students"
      const method = student ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: student ? "Student updated" : "Student registered",
          description: student
            ? "The student has been updated successfully."
            : "The student has been registered successfully.",
        })
        router.push("/students")
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save student",
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
                <FormLabel>{student ? "New Password" : "Password"}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={student ? "Enter new password (leave blank to keep current)" : "Enter password"}
                    {...field}
                    disabled={submitting}
                  />
                </FormControl>
                {student && <FormDescription>Leave blank to keep the current password</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter registration number" {...field} disabled={submitting} />
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
            name="parentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent/Guardian Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter parent/guardian name" {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent/Guardian Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Enter parent/guardian contact" {...field} disabled={submitting} />
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
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {student ? "Update Student" : "Register Student"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
