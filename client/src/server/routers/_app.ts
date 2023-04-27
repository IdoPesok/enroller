import { publicProcedure, router } from "../trpc"
import { courseRouter } from "./courses"
import { exploreRouter } from "./explore"

export const appRouter = router({
  courses: courseRouter,
  explore: exploreRouter,
})

export type AppRouter = typeof appRouter
