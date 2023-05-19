import { prisma } from "@/server/prisma"
import { z } from "zod"
import { studentProcedure, router } from "../trpc"
import { clerkClient } from "@clerk/nextjs"
import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata"
import { Prisma } from "@prisma/client"
import { internalServerError } from "@/lib/trpc"

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
    .query(async ({ ctx, input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { search, cursor, filters } = input

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

      const courses = await prisma.courses.findMany({
        where: {
          CatalogYear: flowchart!.CatalogYear,
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
        cursor: cursor
          ? {
              CatalogYear_Code: {
                CatalogYear: flowchart!.CatalogYear,
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
