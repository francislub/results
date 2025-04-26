"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MarksTable } from "@/components/marks/marks-table"
import { Loader2 } from "lucide-react"

interface MarksFilterProps {
  classes: any[]
  subjects: any[]
  exams: any[]
  filterType: "class" | "subject" | "exam"
}

export function MarksFilter({ classes, subjects, exams, filterType }: MarksFilterProps) {
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedExamId, setSelectedExamId] = useState("")
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchMarks = async () => {
    if (
      (filterType === "class" && !selectedClassId) ||
      (filterType === "subject" && !selectedSubjectId) ||
      (filterType === "exam" && !selectedExamId)
    ) {
      return
    }

    setLoading(true)
    try {
      let url = "/api/marks?"

      if (selectedClassId) {
        // For class filter, we need to get students in the class first
        if (filterType === "class") {
          const studentsResponse = await fetch(`/api/classes/${selectedClassId}/students`)
          const students = await studentsResponse.json()
          const studentIds = students.map((student) => student.id)

          if (studentIds.length > 0) {
            url += `studentIds=${studentIds.join(",")}`
          } else {
            setMarks([])
            setLoading(false)
            return
          }
        } else {
          url += `classId=${selectedClassId}`
        }
      }

      if (selectedSubjectId) {
        url += `${url.includes("?") ? "&" : ""}subjectId=${selectedSubjectId}`
      }

      if (selectedExamId) {
        url += `${url.includes("?") ? "&" : ""}examId=${selectedExamId}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setMarks(data)
    } catch (error) {
      console.error("Error fetching marks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (
      (filterType === "class" && selectedClassId) ||
      (filterType === "subject" && selectedSubjectId) ||
      (filterType === "exam" && selectedExamId)
    ) {
      fetchMarks()
    }
  }, [selectedClassId, selectedSubjectId, selectedExamId, filterType])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(filterType === "subject" || filterType === "exam") && (
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(filterType === "class" || filterType === "exam") && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(filterType === "class" || filterType === "subject") && (
          <div className="space-y-2">
            <Label htmlFor="exam">Exam</Label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger id="exam">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name} ({exam.term} - {exam.academicYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterType === "class" && (
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : marks.length > 0 ? (
        <MarksTable marks={marks} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {filterType === "class" && selectedClassId
            ? "No marks found for this class"
            : filterType === "subject" && selectedSubjectId
              ? "No marks found for this subject"
              : filterType === "exam" && selectedExamId
                ? "No marks found for this exam"
                : "Select filters to view marks"}
        </div>
      )}
    </div>
  )
}
