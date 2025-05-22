import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/grading-systems - Get all grading systems
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Attempting to fetch grading systems from database...")

    // Check if prisma is defined
    if (!prisma) {
      console.error("Prisma client is undefined")
      return NextResponse.json(
        {
          error: "Database connection error",
          message: "Prisma client is undefined. Please check your database connection.",
        },
        { status: 500 },
      )
    }

    // Try to access the gradingSystem model safely
    try {
      const gradingSystems = await prisma.gradingSystem.findMany({
        orderBy: {
          minScore: "desc",
        },
      })
      console.log(`Successfully fetched ${gradingSystems.length} grading systems`)
      return NextResponse.json(gradingSystems)
    } catch (modelError) {
      console.error("Error accessing gradingSystem model:", modelError)
      return NextResponse.json(
        {
          error: "Database model error",
          message: `Error accessing gradingSystem model: ${modelError.message}`,
          details: "Please ensure your Prisma schema includes the GradingSystem model and run 'npx prisma generate'.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching grading systems:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch grading systems",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// POST /api/grading-systems - Create a new grading system
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received request to create grading system:", body)

    // Validate required fields
    if (!body.grade || body.minScore === undefined || body.maxScore === undefined) {
      console.error("Missing required fields in request:", body)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate score ranges
    if (body.minScore < 0 || body.maxScore > 100 || body.minScore >= body.maxScore) {
      console.error("Invalid score range:", { minScore: body.minScore, maxScore: body.maxScore })
      return NextResponse.json(
        {
          error: "Invalid score range. Min score must be less than max score, and scores must be between 0 and 100.",
        },
        { status: 400 },
      )
    }

    // Check if prisma is defined
    if (!prisma) {
      console.error("Prisma client is undefined")
      return NextResponse.json(
        {
          error: "Database connection error",
          message: "Prisma client is undefined. Please check your database connection.",
        },
        { status: 500 },
      )
    }

    try {
      // Check for overlapping ranges
      console.log("Checking for overlapping grade ranges...")
      let existingGradingSystems = []
      try {
        existingGradingSystems = await prisma.gradingSystem.findMany()
        console.log(`Found ${existingGradingSystems.length} existing grading systems`)
      } catch (findError) {
        console.error("Error finding existing grading systems:", findError)
        return NextResponse.json(
          {
            error: "Database error when checking existing grades",
            message: findError.message,
            details: "Please ensure your Prisma schema includes the GradingSystem model and run 'npx prisma generate'.",
          },
          { status: 500 },
        )
      }

      for (const system of existingGradingSystems) {
        // Check if the new range overlaps with existing ranges
        if (
          (body.minScore <= system.maxScore && body.maxScore >= system.minScore) ||
          (system.minScore <= body.maxScore && system.maxScore >= body.minScore)
        ) {
          console.error("Score range overlaps with existing grade:", system)
          return NextResponse.json(
            {
              error: `Score range overlaps with existing grade ${system.grade} (${system.minScore}-${system.maxScore})`,
            },
            { status: 400 },
          )
        }
      }

      // Check if grade already exists
      console.log("Checking if grade already exists:", body.grade)
      let existingGrade = null
      try {
        existingGrade = await prisma.gradingSystem.findFirst({
          where: {
            grade: body.grade,
          },
        })
      } catch (findError) {
        console.error("Error checking if grade exists:", findError)
        return NextResponse.json(
          {
            error: "Database error when checking existing grade",
            message: findError.message,
          },
          { status: 500 },
        )
      }

      if (existingGrade) {
        console.error("Grade already exists:", existingGrade)
        return NextResponse.json({ error: "Grade already exists" }, { status: 400 })
      }

      // Create the grading system
      console.log("Creating new grading system...")
      let gradingSystem
      try {
        gradingSystem = await prisma.gradingSystem.create({
          data: {
            grade: body.grade,
            minScore: Number.parseFloat(body.minScore),
            maxScore: Number.parseFloat(body.maxScore),
            description: body.description || null,
          },
        })
        console.log("Successfully created grading system:", gradingSystem)
      } catch (createError) {
        console.error("Error creating grading system:", createError)
        return NextResponse.json(
          {
            error: "Database error when creating grade",
            message: createError.message,
            details: "Please ensure your Prisma schema includes the GradingSystem model and run 'npx prisma db push'.",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(gradingSystem, { status: 201 })
    } catch (prismaError) {
      console.error("Prisma error:", prismaError)
      return NextResponse.json(
        {
          error: "Database error",
          message: prismaError.message,
          details: "This may be due to the Prisma client not being updated after schema changes.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creating grading system:", error)
    return NextResponse.json(
      {
        error: "Failed to create grading system",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
