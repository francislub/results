"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z
  .object({
    grade: z.string().min(1, "Grade is required"),
    minScore: z
      .string()
      .min(1, "Minimum score is required")
      .refine((val) => !isNaN(Number.parseFloat(val)), {
        message: "Minimum score must be a number",
      })
      .refine((val) => Number.parseFloat(val) >= 0, {
        message: "Minimum score must be at least 0",
      })
      .refine((val) => Number.parseFloat(val) <= 100, {
        message: "Minimum score must be at most 100",
      }),
    maxScore: z
      .string()
      .min(1, "Maximum score is required")
      .refine((val) => !isNaN(Number.parseFloat(val)), {
        message: "Maximum score must be a number",
      })
      .refine((val) => Number.parseFloat(val) >= 0, {
        message: "Maximum score must be at least 0",
      })
      .refine((val) => Number.parseFloat(val) <= 100, {
        message: "Maximum score must be at most 100",
      }),
    description: z.string().optional(),
  })
  .refine((data) => Number.parseFloat(data.minScore) < Number.parseFloat(data.maxScore), {
    message: "Minimum score must be less than maximum score",
    path: ["minScore"],
  })

export function GradingForm({ gradingSystem = null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: gradingSystem?.grade || "",
      minScore: gradingSystem?.minScore?.toString() || "",
      maxScore: gradingSystem?.maxScore?.toString() || "",
      description: gradingSystem?.description || "",
    },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    setError("")

    try {
      const endpoint = gradingSystem ? `/api/grading-systems/${gradingSystem.id}` : "/api/grading-systems"
      const method = gradingSystem ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade: values.grade,
          minScore: Number.parseFloat(values.minScore),
          maxScore: Number.parseFloat(values.maxScore),
          description: values.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save grading system")
      }

      toast({
        title: gradingSystem ? "Grade Updated" : "Grade Created",
        description: gradingSystem
          ? "The grade has been updated successfully."
          : "The grade has been created successfully.",
      })

      router.push("/grading-systems")
      router.refresh()
    } catch (error) {
      console.error("Error saving grading system:", error)
      setError(error.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <FormControl>
                  <Input placeholder="A, B, C, etc." {...field} />
                </FormControl>
                <FormDescription>The letter or name of the grade (e.g., A, B+, Distinction)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="minScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Score</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" step="0.01" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>The minimum score required for this grade (0-100)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Score</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" step="0.01" placeholder="100" {...field} />
                  </FormControl>
                  <FormDescription>The maximum score for this grade (0-100)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description of this grade..." {...field} />
                </FormControl>
                <FormDescription>A brief description of what this grade represents</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {gradingSystem ? "Update Grade" : "Create Grade"}
            </Button>
          </div>
        </form>
      </Form>

      
    </div>
  )
}
