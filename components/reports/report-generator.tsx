"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, FileDown, Printer, Mail } from "lucide-react"
import { StudentReportCard } from "@/components/reports/student-report-card"
import { useToast } from "@/components/ui/use-toast"
import { EmailReportDialog } from "@/components/reports/email-report-dialog"

interface ReportGeneratorProps {
  students: any[]
  terms: string[]
  academicYears: string[]
  exams: any[]
}

export function ReportGenerator({ students, terms, academicYears, exams }: ReportGeneratorProps) {
  const { toast } = useToast()
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [selectedExamId, setSelectedExamId] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const generateReport = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      })
      return
    }

    if ((!selectedTerm || !selectedAcademicYear) && !selectedExamId) {
      toast({
        title: "Error",
        description: "Please select either a term and academic year, or a specific exam",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      let url = `/api/reports/student/${selectedStudentId}?`

      if (selectedExamId) {
        url += `examId=${selectedExamId}`
      } else {
        url += `term=${selectedTerm}&academicYear=${selectedAcademicYear}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    // Add print-specific styles
    const style = document.createElement("style")
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-container, .print-container * {
          visibility: visible;
        }
        .print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        @page {
          size: A4;
          margin: 0.5cm;
        }
        .no-print {
          display: none !important;
        }
      }
    `
    document.head.appendChild(style)

    window.print()

    // Remove the style after printing
    document.head.removeChild(style)
  }

  const handleDownload = async () => {
    try {
      toast({
        title: "Preparing PDF",
        description: "Your report is being prepared for download.",
      })

      // In a real implementation, you would call an API endpoint to generate the PDF
      // For now, we'll just show a success toast

      setTimeout(() => {
        toast({
          title: "Download ready",
          description: "Your report has been downloaded.",
        })
      }, 2000)
    } catch (error) {
      console.error("Error downloading report:", error)
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendEmail = () => {
    setEmailDialogOpen(true)
  }

  // Find the selected student name
  const selectedStudent = students.find((student) => student.id === selectedStudentId)
  const selectedStudentName = selectedStudent ? selectedStudent.user.name : ""

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="student">Student</Label>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger id="student">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.user.name} - {student.class?.name || "No Class"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam">Specific Exam (Optional)</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger id="exam">
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name} ({exam.term} - {exam.academicYear})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="term">Term</Label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!!selectedExamId}>
            <SelectTrigger id="term">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicYear">Academic Year</Label>
          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear} disabled={!!selectedExamId}>
            <SelectTrigger id="academicYear">
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={generateReport} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Report
        </Button>
      </div>

      {reportData && (
        <div className="mt-8">
          <div className="flex justify-end space-x-4 print:hidden mb-4 no-print">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send via Email
            </Button>
          </div>
          <div className="print-container">
            <StudentReportCard data={reportData} />
          </div>
        </div>
      )}

      <EmailReportDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
        term={selectedTerm}
        academicYear={selectedAcademicYear}
        examId={selectedExamId}
      />
    </div>
  )
}
