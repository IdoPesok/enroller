import { router } from "../trpc"
import { authRouter } from "./auth"
import { courseRouter } from "./courses"
import { degreeProgressRouter } from "./degree-progress"
import { exploreRouter } from "./explore"
import { onboardRouter } from "./onboard"
import { sectionRouter } from "./sections"

export const appRouter = router({
  courses: courseRouter,
  explore: exploreRouter,
  onboard: onboardRouter,
  auth: authRouter,
  degreeProgress: degreeProgressRouter,
  section: sectionRouter
})

export type AppRouter = typeof appRouter
