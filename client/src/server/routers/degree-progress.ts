import { prisma } from "@/server/prisma"
import { studentProcedure, router } from "../trpc"
import { clerkClient } from "@clerk/nextjs"
import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata"
import { internalServerError } from "@/lib/trpc"
import { Courses } from "@prisma/client"

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

      // filter for not null courses
      return (await Promise.all(courses)).filter(
        (course) => course
      ) as Courses[]
    } catch (e) {
      throw internalServerError("Error fetching graduation requirements", e)
    }
  }),
})

export type AppRouter = typeof degreeProgressRouter
