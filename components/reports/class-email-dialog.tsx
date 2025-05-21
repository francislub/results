"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface ClassEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  className: string
  students: any[]
  term?: string
  academicYear?: string
  examId?: string
}

export function ClassEmailDialog({
  open,
  onOpenChange,
  classId,
  className,
  students,
  term,
  academicYear,
  examId,
}: ClassEmailDialogProps) {
  const { toast } = useToast()
  const [additionalEmails, setAdditionalEmails] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(true)

  const handleSendEmail = async () => {
    setLoading(true)
    try {
      // Prepare email addresses
      let emailAddresses = []

      // Add student emails if sending to all or selected students
      if (sendToAll) {
        emailAddresses = students.map((student) => student.user.email)
      } else {
        emailAddresses = students
          .filter((student) => selectedStudents.includes(student.id))
          .map((student) => student.user.email)
      }

      // Add additional emails if provided
      if (additionalEmails.trim()) {
        const additionalEmailsArray = additionalEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email)

        emailAddresses = [...emailAddresses, ...additionalEmailsArray]
      }

      if (emailAddresses.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one student or add an email address",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const response = await fetch("/api/reports/class-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId,
          emailAddresses,
          term,
          academicYear,
          examId,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send emails")
      }

      toast({
        title: "Success",
        description: "Report cards have been sent successfully",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error sending emails:", error)
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Class Report Cards</DialogTitle>
          <DialogDescription>Send report cards for {className} students via email</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendToAll"
                checked={sendToAll}
                onCheckedChange={(checked) => {
                  setSendToAll(checked === true)
                  if (checked) {
                    setSelectedStudents([])
                  }
                }}
              />
              <Label htmlFor="sendToAll">Send to all students in class</Label>
            </div>

            {!sendToAll && (
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <Label htmlFor={`student-${student.id}`}>{student.user.name}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="additionalEmails" className="text-right">
              Additional Emails
            </Label>
            <Input
              id="additionalEmails"
              value={additionalEmails}
              onChange={(e) => setAdditionalEmails(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional message to include with the report cards"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSendEmail} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Emails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
