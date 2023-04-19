import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(async (opts) => {
      const { input } = opts;
      return {
        greeting: `hello ${input.text}`,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;