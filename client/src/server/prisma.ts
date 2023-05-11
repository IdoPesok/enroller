/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { env } from "./env"
import { PrismaClient } from "@prisma/client"

const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient
}

export const prisma: PrismaClient =
  prismaGlobal.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["error", "warn", "query"] : ["error"],
  })

// if (env.NODE_ENV === "development") {
//   prisma.$on("query", (e) => {
//     let queryString = e.query
//     JSON.parse(e.params).forEach((param) => {
//       queryString = queryString.replace(
//         "?",
//         typeof param === "string" ? `'${param}'` : param
//       )
//     })

//     console.log(`query ran: ${queryString}`)
//   })
// }

if (env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma
}
