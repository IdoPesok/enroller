import { prisma } from "@/server/prisma"
import { studentProcedure, router } from "../trpc"
import { clerkClient } from "@clerk/nextjs"
import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata"
import { internalServerError } from "@/lib/trpc"
import { Courses, Enrolled_Type } from "@prisma/client"
import { z } from "zod"

export const degreeProgressRouter = router({
  graduationRequirementCourses: studentProcedure.query(async ({ ctx }) => {
    // get the user flow chart
    let flowchartId: string | null = null
    try {
      const user = await clerkClient.users.getUser(ctx.auth.userId)

      if (
        !user.publicMetadata[PUBLIC_METADATA_KEYS.flowchartId] ||
        typeof user.publicMetadata[PUBLIC_METADATA_KEYS.flowchartId] !==
          "string"
      ) {
        throw new Error()
      }

      flowchartId = user.publicMetadata[
        PUBLIC_METADATA_KEYS.flowchartId
      ] as string
    } catch (e) {
      throw internalServerError(
        "User does not have a flowchart ID assigned.",
        e
      )
    }

    const flowchart = await prisma.flowcharts.findUnique({
      where: {
        FlowchartId: flowchartId,
      },
    })
    if (!flowchart) {
      throw internalServerError("User flowchart key doesn't exist.", null)
    }

    // return all courses that are grad requirements
    try {
      const courses = (
        await prisma.graduationRequirements.findMany({
          where: {
            FlowchartId: flowchartId,
          },
        })
      ).map(({ Code }) => {
        // TODO: find a way to do this that is less query intensive
        return prisma.courses.findUnique({
          where: {
            CatalogYear_Code: {
              CatalogYear: flowchart.CatalogYear,
              Code,
            },
          },
        })
      })

      // Wait until all the promises for each course have been resolved
      const resolvedCourses = await Promise.all(courses)

      // Take out any null courses
      const filteredCourses = resolvedCourses.filter(
        (course) => course
      ) as Courses[]

      // Sort the courses with GEs first, then major courses
      const sortedCourses = filteredCourses.sort((courseA, courseB) => {
        // Determine whether the courses are GEs or not
        const isGeneralEducationA =
          courseA.Description?.includes("Fulfills GE Area")
        const isGeneralEducationB =
          courseB.Description?.includes("Fulfills GE Area")

        if (isGeneralEducationA && !isGeneralEducationB) {
          // courseA is a GE, courseB is a major course, so courseA comes first
          return -1
        } else if (!isGeneralEducationA && isGeneralEducationB) {
          // courseA is a major course, courseB is a GE, so courseB comes first
          return 1
        } else if (!isGeneralEducationA && !isGeneralEducationB) {
          // If both are major courses, sort by the number in the Code attribute
          const codeA = courseA.Code.split(" ")[1]
          const codeB = courseB.Code.split(" ")[1]
          return Number(codeA) - Number(codeB)
        } else {
          // If both courses are GEs, maintain order
          return 0
        }
      })

      return sortedCourses
    } catch (e) {
      throw internalServerError("Error fetching graduation requirements", e)
    }
  }),
  enrolledUnits: studentProcedure
    .input(
      z.object({
        term: z.number().positive().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      // make sure section is not null
      let sections = await prisma.enrolled.findMany({
        where: {
          User: ctx.auth.userId,
          Type: Enrolled_Type.Enrolled,
        },
        include: {
          Section: {
            include: {
              Courses: true,
            },
          },
        },
      })

      if (!sections) return 0

      if (input.term) {
        sections = sections.filter((e) => e.Section.TermId === input.term)
      }

      const units = sections.map(({ Section }) => Section.Courses.MinUnits)
      return units.reduce((a, b) => {
        return b ? a! + b : a
      }, 0)
    }),
})

export type AppRouter = typeof degreeProgressRouter
