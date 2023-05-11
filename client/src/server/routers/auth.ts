import { doesUserNeedOnboarding } from "@/lib/auth"
import { clerkClient } from '@clerk/nextjs'
import { protectedProcedure, router } from "../trpc"

export const authRouter = router({
  needsOnboarding: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await clerkClient.users.getUser(ctx.auth.userId);
      return doesUserNeedOnboarding(user.publicMetadata)
    }),
})

export type AppRouter = typeof authRouter
