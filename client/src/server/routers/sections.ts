import { prisma } from "@/server/prisma";
import { z } from "zod";
import { adminProcedure, router } from "../trpc";
import { ZodSectionObject } from "@/interfaces/SectionTypes";

export const sectionRouter = router({
  create: adminProcedure
    .input(ZodSectionObject)
    .mutation(async ({ input }) => {
      const section = await prisma.sections.create({
        data: {
          ...input
        }
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
          SectionId: input.SectionId
        },
        data: {
          ...input
        }
      })

      return section;
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
          SectionId: input.SectionId
        }
      })

      return deletedSection;
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
      })
    )
    .query(async ({ input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { search, cursor, filters } = input

      const sections = await prisma.sections.findMany({
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
            Code: search ? {
              search,
            } : undefined,
            Name: search ? {
              search,
            } : undefined,
            Prefix: filters?.prefixes
              ? {
                  in: filters.prefixes,
                }
              : undefined,
          }
        },
        take: limit + 1,
        cursor: cursor ? {
          SectionId: cursor
        } : undefined
      })

      let nextCursor: typeof cursor | null = null;
      if (sections.length > limit) {
        const nextSections = sections.pop()
        nextCursor = nextSections!.SectionId
      }

      return { sections, nextCursor }
    }),
})

export type AppRouter = typeof sectionRouter;
