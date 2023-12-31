import { prisma } from "@/server/prisma"
import { z } from "zod"
import { adminProcedure, studentProcedure, router } from "../trpc"
import {
  SectionsWithCourseAndCounts,
  ZodSectionObject,
} from "@/interfaces/SectionTypes"
import { fetchCatalogYear } from "@/lib/catalog-year"
import { getSectionsWithCounts } from "@/lib/sections"

export const sectionsRouter = router({
  create: adminProcedure.input(ZodSectionObject).mutation(async ({ input }) => {
    const section = await prisma.sections.create({
      data: {
        ...input,
      },
    })

    return section
  }),
  update: adminProcedure
    .input(
      z.object({
        updateData: ZodSectionObject,
        SectionId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const section = await prisma.sections.update({
        where: {
          SectionId: input.SectionId,
        },
        data: {
          ...input.updateData,
        },
      })

      return section
    }),
  delete: adminProcedure
    .input(
      z.object({
        SectionId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const deletedSection = await prisma.sections.delete({
        where: {
          SectionId: input.SectionId,
        },
      })

      return deletedSection
    }),
  retrieve: adminProcedure
    .input(
      z.object({
        search: z.string(),
        filters: z
          .object({
            prefixes: z.array(z.string()).nullish(),
            professors: z.array(z.string()).nullish(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
        term: z.number().positive().nullish(),
      })
    )
    .query(async ({ input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { search, cursor, filters } = input

      const initial = await prisma.sections.findMany({
        include: {
          Courses: true,
        },
        where: {
          Professor: filters?.professors
            ? {
                in: filters.professors,
              }
            : undefined,
          Courses: {
            Code: search
              ? {
                  search,
                }
              : undefined,
            Name: search
              ? {
                  search,
                }
              : undefined,
            Prefix: filters?.prefixes
              ? {
                  in: filters.prefixes,
                }
              : undefined,
          },
          TermId: input.term ?? undefined,
        },
        take: limit + 1,
        cursor: cursor
          ? {
              SectionId: cursor,
            }
          : undefined,
      })

      const sections = (await getSectionsWithCounts(
        initial
      )) as SectionsWithCourseAndCounts[]

      let nextCursor: typeof cursor | null = null
      if (sections.length > limit) {
        const nextSections = sections.pop()
        nextCursor = nextSections!.SectionId
      }

      return { sections, nextCursor }
    }),
  list: studentProcedure
    .input(
      z.object({
        code: z.string().nullish(),
        term: z.number().positive().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.code) {
        return []
      }

      const catalogYear = await fetchCatalogYear(ctx.auth.userId)

      const sections = await prisma.sections.findMany({
        where: {
          Course: input.code,
          TermId: input.term ?? undefined,
          CatalogYear: catalogYear,
        },
      })
      // this has to be done manually because right now in prisma you cannot
      // do multiple filtered relation counts on the same column

      return await getSectionsWithCounts(sections)
    }),
  withEnrolleds: studentProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const catalogYear = await fetchCatalogYear(ctx.auth.userId)

      const sections = await prisma.sections.findMany({
        where: {
          Course: input.code,
          CatalogYear: catalogYear,
        },
        include: {
          Enrolleds: {
            where: {
              User: ctx.auth.userId,
            },
          },
        },
      })
      return sections
    }),
  withId: studentProcedure
    .input(z.object({ id: z.number().nullish() }))
    .query(async ({ ctx, input }) => {
      if (!input.id) {
        return null
      }

      const catalogYear = await fetchCatalogYear(ctx.auth.userId)

      const section = await prisma.sections.findFirst({
        where: {
          SectionId: input.id,
          CatalogYear: catalogYear,
        },
        include: {
          Courses: true,
        },
      })

      return section
    }),
})

export type AppRouter = typeof sectionsRouter
