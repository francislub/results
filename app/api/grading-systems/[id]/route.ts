import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/grading-systems/[id] - Get a single grading system
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

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
      const gradingSystem = await prisma.gradingSystem.findUnique({
        where: { id },
      })

      if (!gradingSystem) {
        return NextResponse.json({ error: "Grading system not found" }, { status: 404 })
      }

      return NextResponse.json(gradingSystem)
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
    console.error("Error fetching grading system:", error)
    return NextResponse.json({ error: "Failed to fetch grading system" }, { status: 500 })
  }
}

// PUT /api/grading-systems/[id] - Update a grading system
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()

    // Validate required fields
    if (!body.grade || body.minScore === undefined || body.maxScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate score ranges
    if (body.minScore < 0 || body.maxScore > 100 || body.minScore >= body.maxScore) {
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
      // Check if the grading system exists
      const existingGradingSystem = await prisma.gradingSystem.findUnique({
        where: { id },
      })

      if (!existingGradingSystem) {
        return NextResponse.json({ error: "Grading system not found" }, { status: 404 })
      }

      // Check for overlapping ranges with other grades
      const otherGradingSystems = await prisma.gradingSystem.findMany({
        where: {
          id: {
            not: id,
          },
        },
      })

      for (const system of otherGradingSystems) {
        // Check if the new range overlaps with existing ranges
        if (
          (body.minScore <= system.maxScore && body.maxScore >= system.minScore) ||
          (system.minScore <= body.maxScore && system.maxScore >= body.minScore)
        ) {
          return NextResponse.json(
            {
              error: `Score range overlaps with existing grade ${system.grade} (${system.minScore}-${system.maxScore})`,
            },
            { status: 400 },
          )
        }

        // Check if grade already exists (if changing the grade)
        if (body.grade !== existingGradingSystem.grade && system.grade === body.grade) {
          return NextResponse.json({ error: "Grade already exists" }, { status: 400 })
        }
      }

      const updatedGradingSystem = await prisma.gradingSystem.update({
        where: { id },
        data: {
          grade: body.grade,
          minScore: Number.parseFloat(body.minScore),
          maxScore: Number.parseFloat(body.maxScore),
          description: body.description || null,
        },
      })

      return NextResponse.json(updatedGradingSystem)
    } catch (modelError) {
      console.error("Error accessing or updating gradingSystem model:", modelError)
      return NextResponse.json(
        {
          error: "Database model error",
          message: `Error accessing or updating gradingSystem model: ${modelError.message}`,
          details: "Please ensure your Prisma schema includes the GradingSystem model and run 'npx prisma generate'.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating grading system:", error)
    return NextResponse.json({ error: "Failed to update grading system" }, { status: 500 })
  }
}

// DELETE /api/grading-systems/[id] - Delete a grading system
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

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
      // Check if the grading system exists
      const existingGradingSystem = await prisma.gradingSystem.findUnique({
        where: { id },
      })

      if (!existingGradingSystem) {
        return NextResponse.json({ error: "Grading system not found" }, { status: 404 })
      }

      // Delete the grading system
      await prisma.gradingSystem.delete({
        where: { id },
      })

      return NextResponse.json({ message: "Grading system deleted successfully" })
    } catch (modelError) {
      console.error("Error accessing or deleting gradingSystem model:", modelError)
      return NextResponse.json(
        {
          error: "Database model error",
          message: `Error accessing or deleting gradingSystem model: ${modelError.message}`,
          details: "Please ensure your Prisma schema includes the GradingSystem model and run 'npx prisma generate'.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error deleting grading system:", error)
    return NextResponse.json({ error: "Failed to delete grading system" }, { status: 500 })
  }
}
