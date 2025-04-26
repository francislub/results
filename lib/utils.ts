import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function calculateGrade(score: number, gradingSystem: any[]) {
  const grade = gradingSystem.find((g) => score >= g.minScore && score <= g.maxScore)
  return grade ? grade.grade : "N/A"
}

export function calculateAverage(marks: number[]) {
  if (marks.length === 0) return 0
  const sum = marks.reduce((acc, mark) => acc + mark, 0)
  return sum / marks.length
}
