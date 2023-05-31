import { prisma } from "@/server/prisma"
import { z } from "zod"
import { studentProcedure, router } from "../trpc"
import { enrolledSchema } from "@/interfaces/EnrolledTypes"
import { clerkClient } from "@clerk/nextjs"
import { Enrolled_Type } from "@prisma/client"

export const enrollRouter = router({
  create: studentProcedure
    .input(enrolledSchema)
    .mutation(async ({ ctx, input }) => {
      const section = await prisma.enrolled.create({
        data: {
          User: ctx.auth.userId,
          ...input,
        },
      })

      return section
    }),
  update: studentProcedure
    .input(
      z.object({
        SectionId: z.number(),
        Data: enrolledSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const section = await prisma.enrolled.update({
        where: {
          User_SectionId: {
            User: ctx.auth.userId,
            SectionId: input.SectionId,
          },
        },
        data: {
          ...input.Data,
        },
      })

      return section
    }),
  delete: studentProcedure
    .input(
      z.object({
        SectionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deletedSection = await prisma.enrolled.delete({
        where: {
          User_SectionId: {
            User: ctx.auth.userId,
            SectionId: input.SectionId,
          },
        },
      })

      return deletedSection
    }),
  list: studentProcedure.query(async ({ ctx }) => {
    const enrolled = await prisma.enrolled.findMany({
      where: {
        User: ctx.auth.userId,
      },
    })
    return enrolled
  }),
  listWithSectionCourses: studentProcedure.query(async ({ ctx }) => {
    const enrolled = await prisma.enrolled.findMany({
      where: {
        User: ctx.auth.userId,
      },
      include: {
        Section: {
          include: {
            Courses: true,
          },
        },
      },
    })
    return enrolled
  }),
})

export type AppRouter = typeof enrollRouter
