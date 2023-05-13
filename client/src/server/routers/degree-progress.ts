import { prisma } from "@/server/prisma"
import { studentProcedure, router } from "../trpc"
import { clerkClient } from "@clerk/nextjs";
import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata";
import { internalServerError } from "@/lib/trpc";
import { Courses } from "@prisma/client";

export const degreeProgressRouter = router({
  graduationRequirementCourses: studentProcedure
    .query(async ({ ctx }) => {
      // get the user flow chart
      let flowchartId: string | null = null
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);

        if (!user.publicMetadata[PUBLIC_METADATA_KEYS.flowchartId] || typeof user.publicMetadata[PUBLIC_METADATA_KEYS.flowchartId] !== "string") {
          throw new Error();
        }

        flowchartId = user.publicMetadata[PUBLIC_METADATA_KEYS.flowchartId] as string
      } catch (e) {
        throw internalServerError("User does not have a flowchart ID assigned.", e)
      }

      // return all courses that are grad requirements
      try {
        const courses = (await prisma.graduationRequirements.findMany({
          where: {
            FlowchartId: flowchartId
          },
          include: {
            CourseCodeMapping: {
              include: {
                Course: true
              }
            }
          }
        })).filter((gradReq) => gradReq.CourseCodeMapping !== null).map((gradReq) => gradReq.CourseCodeMapping.Course)

        // filter for not null courses
        return courses.filter((course) => course !== null) as Courses[];
      } catch (e) {
        throw internalServerError("Error fetching graduation requirements", e)
      }
    }),
})

export type AppRouter = typeof degreeProgressRouter
