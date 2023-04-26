import { z } from "zod"
import { publicProcedure, router } from "../trpc"
import { prisma } from "@/server/prisma"

export const courseRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { search, cursor } = input

      const courses = await prisma.courses.findMany({
        where: {
          Code: {
            search,
          },
          Name: {
            search,
          },
        },
        take: limit + 1,
        cursor: cursor ? { Code: cursor } : undefined,
      })
      let nextCursor: string | undefined = undefined
      if (courses.length > limit) {
        const nextCourses = courses.pop()
        nextCursor = nextCourses!.Code
      }

      return { courses, nextCursor }
    }),
})

export type AppRouter = typeof courseRouter
