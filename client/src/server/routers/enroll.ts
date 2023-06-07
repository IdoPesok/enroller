import { prisma } from "@/server/prisma"
import { clerkClient } from "@clerk/nextjs"
import { z } from "zod"
import { studentProcedure, router, adminProcedure } from "../trpc"
import {
  EnrolledWithUserData,
  enrolledSchema,
} from "@/interfaces/EnrolledTypes"

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
  listShoppingCart: studentProcedure.query(async ({ ctx }) => {
      console.log(ctx.auth.userId)
  
      const enrolled = await prisma.enrolled.findMany({
        where: {
          User: ctx.auth.userId,
          Type: "ShoppingCart",
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

  //TODO: need to make a check if someone checked off to be added to the waitlist
  enrollShoppingCart: studentProcedure.mutation(async ({ ctx }) => {
      console.log(ctx.auth.userId)
  
      //do 2 queries and select from 2 separate ones?
      //select the 2 separate sets and mutate individually

      // have to query _count in 
      // use a join and group by for query
      // need to determine if the section should:
      //  - go into enrolled (fewer enrolled than capacity)
      //  - go into waitlist (more enrolled than capacity, fewer waitlist than waitlist capacity)
      //  - nothing, stays in shopping cart

      // query all shopping cart for the user
          //join with section on sectionid

      // need to fill in the seat as well

      // all shopping cart vals
      const shopping = await prisma.enrolled.findMany({
        where: {
          User: ctx.auth.userId,
          Type: "ShoppingCart",
        },
        include: {
          Section: true,
        },
      })

      // count the number of sections in enrolled that are of the same as the user
      // go through their shopping cart and enroll or waitlist them

      // have to query _count in 
      // need to determine if the section should:
      //  - go into enrolled (fewer enrolled than capacity)
      //  - go into waitlist (more enrolled than capacity, fewer waitlist than waitlist capacity)
      //  - nothing, stays in shopping cart

      for (var sect of shopping){
          //counts number of enrolled seats
          const numTakenSeats = await prisma.enrolled.count({
              where : {
                  SectionId : sect.SectionId, //could do section itself
                  Type: "Enrolled",
              }
          })

          const numWaitlistedSeats = await prisma.enrolled.count({
              where : {
                  SectionId : sect.SectionId, //could do section itself
                  Type: "Waitlist",
              }
          })

          //TODO: error when section is null
          // enroll user into section if not full, double check it's in shoppingcart
          if(sect.Section.Capacity != null && numTakenSeats < sect.Section.Capacity && sect.Type == "ShoppingCart"){
              const enrollSection = await prisma.enrolled.update({
                  where: {
                      User_SectionId: {
                          User: ctx.auth.userId,
                          SectionId: sect.SectionId,
                      },
                  },
                  data: {
                      Type: "Enrolled",
                      Seat: numTakenSeats + 1,
                  },
              })
          } //input into waitlist if waitlist not full
          else if(sect.Section.Capacity != null && numTakenSeats >= sect.Section.Capacity
                  && sect.Section.WaitlistCapacity != null && numWaitlistedSeats < sect.Section.WaitlistCapacity 
                  && sect.Type == "ShoppingCart"){
              const waitlistSection = await prisma.enrolled.update({
                  where: {
                      User_SectionId: {
                          User: ctx.auth.userId,
                          SectionId: sect.SectionId,
                      },
                  },
                  data: {
                      Type: "Waitlist",
                      Seat: numWaitlistedSeats + 1,
                  }
              })
          }
          else{
              //Mention waitlist was full / class is closed
          }
      }

      
      //TODO: return status messages
      

      //return enrolled
      //return status code if enroll success or failure
      //use default trpc? internal server error?
      //put error message?
      //return what was enrolled
  }),
})

export type AppRouter = typeof enrollRouter
