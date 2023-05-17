import { prisma } from "@/server/prisma"
import { z } from "zod"
import { studentProcedure, router } from "../trpc"
import { Prisma } from "@prisma/client"

export const courseRouter = router({
  course: studentProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const course = await prisma.courses.findUnique({
        where: {
          Code: input.code,
        },
      })
      return course
    }),
  withSections: studentProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const course = await prisma.courses.findUnique({
        where: {
          Code: input.code,
        },
        include: {
          Sections: true,
        },
      })
      return course
    }),
  list: studentProcedure
    .input(
      z.object({
        search: z.string(),
        filters: z
          .object({
            prefixes: z.array(z.string()).nullish(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { search, cursor, filters } = input

      const courses = await prisma.courses.findMany({
        where: {
          Code: {
            search,
          },
          Name: {
            search,
          },
          // Description: {
          //   search,
          // },
          Prefix: filters?.prefixes
            ? {
                in: filters.prefixes,
              }
            : undefined,
        },
        orderBy: {
          _relevance: {
            fields: ["Code", "Name"],
            search,
            sort: "asc",
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
