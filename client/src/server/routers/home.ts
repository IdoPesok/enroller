import { prisma } from "@/server/prisma"
import { z } from "zod"
import { studentProcedure, router } from "../trpc"
import { Enrolled_Type } from "@prisma/client"

// tylerjcollins.csc user id: user_2QDp9b95iUuYTE2TVxBS6cRJK4F

export const homeRouter = router({

    userSections: studentProcedure
        .input(z.object({ types: z.array(z.nativeEnum(Enrolled_Type)) }))
        .query(async ({ input, ctx }) => {
            const sections = await prisma.enrolled.findMany({
            where: {
                User: ctx.auth.userId,
                Type: { in: input.types }
            },
            include: {
                Section: true
            }
            });
            return sections.map(enrollment => [enrollment.Section, enrollment.Type]);
        })
})

export type AppRouter = typeof homeRouter
