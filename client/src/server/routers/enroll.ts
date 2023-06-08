import { prisma } from "@/server/prisma"
import { clerkClient } from "@clerk/nextjs"
import { z } from "zod"
import { studentProcedure, router, adminProcedure } from "../trpc"
import {
  EnrolledWithUserData,
  EnrollmentTransaction,
  enrolledSchema,
} from "@/interfaces/EnrolledTypes"
import { Enrolled, Enrolled_Type } from "@prisma/client"
import { internalServerError } from "@/lib/trpc"
import { TRPCError } from "@trpc/server"

async function enroll(
  userId: string,
  sectionId: number,
  waitlist?: boolean
): Promise<EnrollmentTransaction> {
  try {
    const numTakenSeats = await prisma.enrolled.count({
      where: {
        SectionId: sectionId, //could do section itself
        Type: "Enrolled",
      },
    })

    const numWaitlistedSeats = await prisma.enrolled.count({
      where: {
        SectionId: sectionId, //could do section itself
        Type: "Waitlist",
      },
    })

    const section = await prisma.enrolled.findFirst({
      where: {
        User: userId,
        SectionId: sectionId,
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
            User: userId,
            SectionId: section.SectionId,
          },
        },
        data: {
          Type: Enrolled_Type.Enrolled,
          Seat: numTakenSeats + 1,
        },
      })

      return {
        status: "success",
        message: `${section.Section.Course} (${section.SectionId}) successfully enrolled`,
        waitlisted: false,
      }
    } else if (
      section?.Section.Capacity != null &&
      numTakenSeats >= section.Section.Capacity &&
      section.Section.WaitlistCapacity != null &&
      numWaitlistedSeats < section.Section.WaitlistCapacity &&
      section.Type === Enrolled_Type.ShoppingCart &&
      waitlist
    ) {
      //input into waitlist if waitlist not full
      await prisma.enrolled.update({
        where: {
          User_SectionId: {
            User: userId,
            SectionId: section.SectionId,
          },
        },
        data: {
          Type: "Waitlist",
          Seat: numWaitlistedSeats + 1,
        },
      })

      return {
        status: "success",
        message: `${section.Section.Course} (${section.SectionId}) WAITLISTED`,
        waitlisted: false,
      }
    } else {
      return {
        status: "failure",
        message: "Class is full",
        waitlisted: false,
      }
    }
  } catch (e) {
    return {
      status: "failure",
      message: "Could not enroll in class due to database error",
      waitlisted: false,
    }
  }
}

async function drop(
  userId: string,
  sectionId: number
): Promise<Enrolled> {
  try {
    const enrolled = await prisma.enrolled.findFirst({
      where: {
        User: userId,
        SectionId: sectionId,
      },
    })

    if (!enrolled) {
      throw internalServerError("Could not find enrolled record")
    }

    const dropped = await prisma.enrolled.delete({
      where: {
        User_SectionId: {
          User: userId,
          SectionId: sectionId,
        },
      },
    })

    if (enrolled.Type === Enrolled_Type.Enrolled && enrolled.Seat != null) {
      // move all the seat numbers down by one
      const enrolledRecords = await prisma.enrolled.findMany({
        where: {
          SectionId: sectionId,
          Type: Enrolled_Type.Enrolled,
          Seat: {
            gt: enrolled.Seat ?? undefined,
          },
        },
      })

      const transactions: Promise<Enrolled>[] = []
      for (const enrolledRecord of enrolledRecords) {
        if (!enrolledRecord.Seat) continue
        transactions.push(
          prisma.enrolled.update({
            where: {
              User_SectionId: {
                User: enrolledRecord.User,
                SectionId: sectionId,
              },
            },
            data: {
              Seat: enrolledRecord.Seat - 1,
            },
          })
        )
      }

      await Promise.all(transactions)

      const waitlisted = await prisma.enrolled.findFirst({
        where: {
          SectionId: sectionId,
          Type: Enrolled_Type.Waitlist,
        },
        orderBy: {
          Seat: "asc",
        },
      })

      // if there is a waitlist, move the first person in the waitlist to enrolled
      if (waitlisted) {
        await prisma.enrolled.update({
          where: {
            User_SectionId: {
              User: waitlisted.User,
              SectionId: sectionId,
            },
          },
          data: {
            Type: Enrolled_Type.Enrolled,
            Seat: enrolledRecords.length + 1,
          },
        })
      }
    }

    return dropped;
  } catch (e) {
    throw internalServerError("Could not drop class due to database error")
  }
}

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
      return await drop(ctx.auth.userId, input.SectionId)
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
      return await drop(input.UserId, input.SectionId)
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
      const transactions: Promise<EnrollmentTransaction>[] = []

      for (const { SectionId, ToWaitlist } of input) {
        transactions.push(enroll(ctx.auth.userId, SectionId, ToWaitlist))
      }

      return await Promise.all(transactions)
    }),
})

export type AppRouter = typeof enrollRouter
