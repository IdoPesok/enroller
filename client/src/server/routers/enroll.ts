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

    enrollShoppingCart: studentProcedure.query(async ({ ctx }) => {
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


        // const enroll = await prisma.enrolled.updateMany({
        //     where: {
        //         User: ctx.auth.userId,
        //         Type: "ShoppingCart",
        //         Section: {
        //             //have to query if capacity is greater than max
        //         },
        //     },
        //     data :{

        //     }
        // }),

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


//     // convert shopping cart to enrolled. If section is full put into waitlist?
//     updateToEnrolled: studentProcedure
//         .input(enrolledSchema)
//         .mutation(async ({ ctx, input }) => {
//         const updateSection = await prisma.enrolled.update({
//             where: {
//             User_SectionId: {
//                 User: ctx.auth.userId,
//                 SectionId: input.SectionId,
//             },
//             },
//             data: {
//                 Type: "Enrolled",
//             },
//         })

//         return updateSection
//     }),

//     updateToWaitlist: studentProcedure
//         .input(enrolledSchema)
//         .mutation(async ({ ctx, input }) => {
//         const updateSection = await prisma.enrolled.update({
//             where: {
//             User_SectionId: {
//                 User: ctx.auth.userId,
//                 SectionId: input.SectionId,
//             },
//             },
//             data: {
//                 Type: "Waitlist",
//             },
//         })

//     return updateSection
// }),





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

export type AppRouter = typeof enrollRouter