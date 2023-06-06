import { prisma } from "@/server/prisma"
import { router, protectedProcedure } from "../trpc"

export const termRouter = router({
  list: protectedProcedure.query(async ({}) => {
    const terms = await prisma.term.findMany({
      orderBy: {
        TermId: "desc",
      },
    })

    return terms
  }),
})

export type AppRouter = typeof termRouter
