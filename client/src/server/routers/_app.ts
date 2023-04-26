import { publicProcedure, router } from "../trpc"
import { courseRouter } from "./courses"

export const appRouter = router({
  courses: courseRouter,
})

export type AppRouter = typeof appRouter
