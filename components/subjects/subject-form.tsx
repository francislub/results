"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Form } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  description: z.string().optional(),
})

interface SubjectFormProps {
  subject?: any
}

export function SubjectForm({ subject }: SubjectFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject?.name || "",
      code: subject?.code || "",
      description: subject?.description || "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    try {
      const url = subject ? `/api/subjects/${subject.id}` : "/api/subjects"
      const method = subject ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: subject ? "Subject updated" : "Subject created",
          description: subject
            ? "The subject has been updated successfully."
            : "The subject has been created successfully.",
        })
        router.push("/subjects")
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save subject",
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
        <div className="gri\
