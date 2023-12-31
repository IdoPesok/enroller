import { prisma } from "@/server/prisma"
import { z } from "zod"
import { studentProcedure, router } from "../trpc"
import { Enrolled_Type } from "@prisma/client"

// tylerjcollins.csc user id: user_2QDp9b95iUuYTE2TVxBS6cRJK4F

export const homeRouter = router({
  userSections: studentProcedure
    .input(
      z.object({
        types: z.array(z.nativeEnum(Enrolled_Type)),
        quarter: z.number().positive().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const sections = await prisma.enrolled.findMany({
        where: {
          User: ctx.auth.userId,
          Type: { in: input.types },
        },
        include: {
          Section: {
            include: {
              Courses: true,
            },
          },
        },
      })
      return sections.filter(
        (section) => section.Section.TermId === input.quarter
      )
    }),
})

export type AppRouter = typeof homeRouter
