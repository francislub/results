import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
export const gradingSystem = [
  { min: 90, max: 100, grade: "D.1" },
  { min: 80, max: 89, grade: "D.2" },
  { min: 70, max: 79, grade: "D.3" },
  { min: 60, max: 69, grade: "C.4" },
  { min: 50, max: 59, grade: "C.5" },
  { min: 45, max: 49, grade: "C.6" },
  { min: 40, max: 44, grade: "P.7" },
  { min: 35, max: 39, grade: "P.8" },
  { min: 0, max: 34, grade: "F.9" },
]

export function calculateGrade(score: number): string {
  const gradingSystem = [
    { min: 90, max: 100, grade: "D.1" },
    { min: 80, max: 89, grade: "D.2" },
    { min: 70, max: 79, grade: "D.3" },
    { min: 60, max: 69, grade: "C.4" },
    { min: 50, max: 59, grade: "C.5" },
    { min: 45, max: 49, grade: "C.6" },
    { min: 40, max: 44, grade: "P.7" },
    { min: 35, max: 39, grade: "P.8" },
    { min: 0,  max: 34, grade: "F.9" },
  ];

  for (const grade of gradingSystem) {
    if (score >= grade.min && score <= grade.max) {
      return grade.grade;
    }
  }
  return "N/A";
}


