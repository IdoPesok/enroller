import { router } from "../trpc"
import { authRouter } from "./auth"
import { courseRouter } from "./courses"
import { exploreRouter } from "./explore"
import { onboardRouter } from "./onboard"

export const appRouter = router({
  courses: courseRouter,
  explore: exploreRouter,
  onboard: onboardRouter,
  auth: authRouter
})

export type AppRouter = typeof appRouter
