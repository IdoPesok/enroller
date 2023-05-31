import { prisma } from "@/server/prisma"
import { z } from "zod"
import { studentProcedure, router, protectedProcedure } from "../trpc"
import { fetchCatalogYear } from "@/lib/catalog-year"

export const courseRouter = router({
  course: studentProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const catalogYear = await fetchCatalogYear(ctx.auth.userId)

      const course = await prisma.courses.findUnique({
        where: {
          CatalogYear_Code: {
            CatalogYear: catalogYear,
            Code: input.code,
          },
        },
      })
      return course
    }),
  courseCodeSearch: protectedProcedure
    .input(z.object({ search: z.string().nullish() }))
    .query(async ({ input }) => {
      const { search } = input

      if (!search || search.length < 2) return []

      return (
        await prisma.courses.findMany({
          select: {
            Code: true,
          },
          where: {
            Code: {
              search,
            },
            Name: {
              search,
            },
          },
        })
      ).map((course) => course.Code)
    }),
  coursePrefixes: protectedProcedure.query(async () => {
    const prefixes = await prisma.courses.findMany({
      select: {
        Prefix: true,
      },
      distinct: ["Prefix"],
    })
    return prefixes.map((prefix) => prefix.Prefix)
  }),
  withSections: studentProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const catalogYear = await fetchCatalogYear(ctx.auth.userId)

      const course = await prisma.courses.findUnique({
        where: {
          CatalogYear_Code: {
            CatalogYear: catalogYear,
            Code: input.code,
          },
        },
        include: {
          Sections: true,
        },
      })
      return course
    }),
  list: protectedProcedure
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
    .query(async ({ ctx, input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { search, cursor, filters } = input

      const catalogYear = await fetchCatalogYear(ctx.auth.userId)

      const courses = await prisma.courses.findMany({
        where: {
          CatalogYear: catalogYear,
          Code: {
            search,
          },
          Name: {
            search,
          },
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
        cursor: cursor
          ? {
              CatalogYear_Code: {
                CatalogYear: catalogYear,
                Code: cursor,
              },
            }
          : undefined,
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
