"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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

// Create different schemas based on user role
const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  staffId: z.string().min(2, "Staff ID is required"),
})

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  staffId: z.string().min(2, "Staff ID is required"),
  qualification: z.string().min(2, "Qualification is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.date().optional(),
  contact: z.string().min(2, "Contact is required"),
  address: z.string().optional(),
})

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  registrationNo: z.string().min(2, "Registration number is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.date().optional(),
  parentName: z.string().min(2, "Parent name is required"),
  parentContact: z.string().min(2, "Parent contact is required"),
  address: z.string().optional(),
})

interface ProfileFormProps {
  userData: any
  userRole: string
}

export function ProfileForm({ userData, userRole }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  // Select the appropriate schema based on user role
  const formSchema = userRole === "ADMIN" ? adminSchema : userRole === "TEACHER" ? teacherSchema : studentSchema

  // Set up form with the appropriate schema and default values
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userData.user.name || "",
      email: userData.user.email || "",
      ...(userRole === "ADMIN" && {
        staffId: userData.staffId || "",
      }),
      ...(userRole === "TEACHER" && {
        staffId: userData.staffId || "",
        qualification: userData.qualification || "",
        gender: userData.gender || undefined,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        contact: userData.contact || "",
        address: userData.address || "",
      }),
      ...(userRole === "STUDENT" && {
        registrationNo: userData.registrationNo || "",
        gender: userData.gender || undefined,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        parentName: userData.parentName || "",
        parentContact: userData.parentContact || "",
        address: userData.address || "",
      }),
    },
  })

  const onSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      let url = ""
      if (userRole === "ADMIN") {
        url = `/api/admins/${userData.id}`
      } else if (userRole === "TEACHER") {
        url = `/api/teachers/${userData.id}`
      } else {
        url = `/api/students/${userData.id}`
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update profile",
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

          {userRole === "ADMIN" && (
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
          )}

          {userRole === "TEACHER" && (
            <>
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
            </>
          )}

          {userRole === "STUDENT" && (
            <>
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
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
          </Button>
        </div>
      </form>
    </Form>
  )
}
