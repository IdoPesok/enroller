import { router } from "../trpc"
import { authRouter } from "./auth"
import { courseRouter } from "./courses"
import { degreeProgressRouter } from "./degree-progress"
import { exploreRouter } from "./explore"
import { onboardRouter } from "./onboard"
import { enrollRouter } from "./enroll"

export const appRouter = router({
  courses: courseRouter,
  explore: exploreRouter,
  onboard: onboardRouter,
  auth: authRouter,
  degreeProgress: degreeProgressRouter,
  enroll: enrollRouter
})

export type AppRouter = typeof appRouter
