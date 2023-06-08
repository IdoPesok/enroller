import { prisma } from "@/server/prisma"
import { clerkClient } from "@clerk/nextjs"
import { z } from "zod"
import { studentProcedure, router, adminProcedure } from "../trpc"
import {
  EnrolledWithUserData,
  EnrollmentTransaction,
  enrolledSchema,
} from "@/interfaces/EnrolledTypes"
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
  usersEnrolledInSection: adminProcedure
    .input(
      z.object({
        SectionId: z.number().min(0),
      })
    )
    .query(async ({ input }) => {
      const enrolled = await prisma.enrolled.findMany({
        where: {
          SectionId: input.SectionId,
        },
      })

      const ret: EnrolledWithUserData[] = []

      for (const e of enrolled) {
        const clerkUser = await clerkClient.users.getUser(e.User)

        if (clerkUser) {
          ret.push({
            ...e,
            userData: clerkUser,
          })
        }
      }

      return ret
    }),
  unenrollUser: adminProcedure
    .input(
      z.object({
        SectionId: z.number().min(0),
        UserId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const enrolled = await prisma.enrolled.delete({
        where: {
          User_SectionId: {
            User: input.UserId,
            SectionId: input.SectionId,
          },
        },
      })

      return enrolled
    }),
  listShoppingCart: studentProcedure
    .input(
      z.object({
        term: z.number().positive().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const enrolled = await prisma.enrolled.findMany({
        where: {
          User: ctx.auth.userId,
          Type: Enrolled_Type.ShoppingCart,
        },
        include: {
          Section: {
            include: {
              Courses: true,
            },
          },
        },
      })

      if (input.term) {
        return enrolled.filter((e) => e.Section.TermId === input.term)
      }

      return enrolled
    }),

  enrollSection: studentProcedure
    .input(
      z.array(
        z.object({
          SectionId: z.number(),
          ToWaitlist: z.boolean(), //whether to add to waitlist or not
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const transactions: EnrollmentTransaction[] = []

      for (const { SectionId, ToWaitlist } of input) {
        try {
          const numTakenSeats = await prisma.enrolled.count({
            where: {
              SectionId: SectionId, //could do section itself
              Type: "Enrolled",
            },
          })

          const numWaitlistedSeats = await prisma.enrolled.count({
            where: {
              SectionId: SectionId, //could do section itself
              Type: "Waitlist",
            },
          })

          const section = await prisma.enrolled.findFirst({
            where: {
              User: ctx.auth.userId,
              SectionId: SectionId,
              Type: "ShoppingCart",
            },
            include: {
              Section: true,
            },
          })

          if (
            section?.Section.Capacity != null &&
            numTakenSeats < section.Section.Capacity &&
            section.Type == Enrolled_Type.ShoppingCart
          ) {
            await prisma.enrolled.update({
              where: {
                User_SectionId: {
                  User: ctx.auth.userId,
                  SectionId: section.SectionId,
                },
              },
              data: {
                Type: Enrolled_Type.Enrolled,
                Seat: numTakenSeats + 1,
              },
            })

            transactions.push({
              status: "success",
              message: `${section.Section.Course} (${section.SectionId}) successfully enrolled`,
              waitlisted: false,
            })
          } else if (
            section?.Section.Capacity != null &&
            numTakenSeats >= section.Section.Capacity &&
            section.Section.WaitlistCapacity != null &&
            numWaitlistedSeats < section.Section.WaitlistCapacity &&
            section.Type === Enrolled_Type.ShoppingCart &&
            ToWaitlist
          ) {
            //input into waitlist if waitlist not full
            await prisma.enrolled.update({
              where: {
                User_SectionId: {
                  User: ctx.auth.userId,
                  SectionId: section.SectionId,
                },
              },
              data: {
                Type: "Waitlist",
                Seat: numWaitlistedSeats + 1,
              },
            })

            transactions.push({
              status: "success",
              message: `${section.Section.Course} (${section.SectionId}) WAITLISTED`,
              waitlisted: false,
            })
          } else {
            transactions.push({
              status: "failure",
              message: "Class is full",
              waitlisted: false,
            })
          }
        } catch (e) {
          transactions.push({
            status: "failure",
            message: "Could not enroll in class due to database error",
            waitlisted: false,
          })
        }
      }

      return transactions
    }),
})

export type AppRouter = typeof enrollRouter
