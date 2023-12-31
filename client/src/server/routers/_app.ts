import { router } from "../trpc"
import { authRouter } from "./auth"
import { courseRouter } from "./courses"
import { degreeProgressRouter } from "./degree-progress"
import { enrollRouter } from "./enroll"
import { exploreRouter } from "./explore"
import { homeRouter } from "./home"
import { onboardRouter } from "./onboard"
import { sectionsRouter } from "./sections"
import { termRouter } from "./term"

export const appRouter = router({
  courses: courseRouter,
  explore: exploreRouter,
  onboard: onboardRouter,
  auth: authRouter,
  degreeProgress: degreeProgressRouter,
  home: homeRouter,
  sections: sectionsRouter,
  enroll: enrollRouter,
  term: termRouter,
})

export type AppRouter = typeof appRouter
