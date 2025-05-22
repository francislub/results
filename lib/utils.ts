import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function calculateAverage(scores: number[]) {
  if (scores.length === 0) return 0
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

export function calculateGrade(score: number, gradingSystem: any[]) {
  if (!gradingSystem || gradingSystem.length === 0) {
    console.log("No grading system provided for score:", score)
    return "N/A"
  }

  console.log(`Calculating grade for score ${score} with ${gradingSystem.length} grade entries`)

  const grade = gradingSystem.find((item) => {
    const result = score >= item.minScore && score <= item.maxScore
    console.log(`Checking grade ${item.grade}: ${item.minScore}-${item.maxScore}, match: ${result}`)
    return result
  })

  if (grade) {
    console.log(`Found matching grade: ${grade.grade}`)
    return grade.grade
  } else {
    console.log("No matching grade found for score:", score)
    return "N/A"
  }
}
