import { doesUserNeedOnboarding } from "@/lib/auth"
import { clerkClient } from '@clerk/nextjs'
import { adminProcedure, protectedProcedure, router } from "../trpc"
import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata";
import { internalServerError } from "@/lib/trpc";

export const authRouter = router({
  needsOnboarding: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await clerkClient.users.getUser(ctx.auth.userId);
      return doesUserNeedOnboarding(user.publicMetadata)
    }),
  demoteUserRole: adminProcedure
    .mutation(async ({ ctx }) => {
      // update the user's metadata
      try {
        const user = await clerkClient.users.getUser(ctx.auth.userId);

        await clerkClient.users.updateUser(
          ctx.auth.userId,
          {
            publicMetadata: {
              ...user.publicMetadata,
              [PUBLIC_METADATA_KEYS.role]: undefined,
            }
          }
        )

        return true;
      } catch (e) {
        throw internalServerError("Failed to demote user authorization", e)
      }
    }),
})

export type AppRouter = typeof authRouter
