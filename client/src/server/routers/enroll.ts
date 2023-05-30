import { prisma } from "@/server/prisma"
import { z } from "zod"
import { studentProcedure, router } from "../trpc"
//import { Enrolled_Type } from "@prisma/client"
import { enrolledSchema } from "@/interfaces/EnrolledTypes"
import { Enrolled } from "@prisma/client"

export const enrollRouter = router({

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

    // convert shopping cart to enrolled. If section is full put into waitlist?
    updateToEnrolled: studentProcedure
        .input(enrolledSchema)
        .mutation(async ({ ctx, input }) => {
        const updateSection = await prisma.enrolled.update({
            where: {
            User_SectionId: {
                User: ctx.auth.userId,
                SectionId: input.SectionId,
            },
            },
            data: {
                Type: "Enrolled",
            },
        })

        return updateSection
    }),

    updateToWaitlist: studentProcedure
        .input(enrolledSchema)
        .mutation(async ({ ctx, input }) => {
        const updateSection = await prisma.enrolled.update({
            where: {
            User_SectionId: {
                User: ctx.auth.userId,
                SectionId: input.SectionId,
            },
            },
            data: {
                Type: "Waitlist",
            },
        })

    return updateSection
}),





    // userShoppingCart: studentProcedure
    //     .input(z.object({ user: z.string(), types: z.array(z.nativeEnum(Enrolled_Type)) }))
    //     .query(async ({ input, ctx }) => {
    //         const sections = await prisma.enrolled.findMany({
    //         where: {
    //             User: ctx.auth.userId,
    //             Type: Enrolled_Type.ShoppingCart
    //         },
    //         include: {
    //             Section: true
    //         }
    //         });
    //         return sections.map(enrollment => enrollment.Section);
    //     }),

    //need user and their shopping cart to swap its type
    // userEnroll: studentProcedure
    //     .input(
    //         z.object({
    //             user: z.string()
    //         })
    //     )
})