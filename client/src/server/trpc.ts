import { initTRPC, TRPCError } from "@trpc/server"
import { type Context } from "./context"
import { clerkClient, currentUser } from '@clerk/nextjs'
import { transformer } from "@/lib/transformer"
import { isUserAdmin } from "@/lib/auth"

const t = initTRPC.context<Context>().create({
  transformer,
  errorFormatter({ shape }) {
    return shape
  },
})

// check if the user is signed in as a student, otherwise through a UNAUTHORIZED CODE
const isStudentAuth = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  const user = await clerkClient.users.getUser(ctx.auth.userId);
  if (!user || isUserAdmin(user.publicMetadata)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have the required student role." })
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  })
})

// check if the user is signed in as a student, otherwise through a UNAUTHORIZED CODE
const isAdminAuth = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId || !ctx.auth.user || !isUserAdmin(ctx.auth.user.publicMetadata)) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  const user = await clerkClient.users.getUser(ctx.auth.userId);
  if (!user || !isUserAdmin(user.publicMetadata)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have the required admin role." })
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  })
})

const isAuth = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  })
})

export const router = t.router

export const publicProcedure = t.procedure

export const studentProcedure = t.procedure.use(isStudentAuth)
export const adminProcedure = t.procedure.use(isAdminAuth)
export const protectedProcedure = t.procedure.use(isAuth)
