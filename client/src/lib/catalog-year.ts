import { prisma } from "@/server/prisma"
import { clerkClient } from "@clerk/nextjs"
import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata"
import { internalServerError } from "@/lib/trpc"
import { isUserAdmin } from "./auth"

export async function fetchCatalogYear(userId: string): Promise<string> {
  const user = await clerkClient.users.getUser(userId)

  if (isUserAdmin(user.publicMetadata)) {
    // get the latest catalog year
    return (
      await prisma.catalogs.findMany({
        orderBy: {
          CatalogYear: "desc",
        },
        take: 1,
      })
    )[0].CatalogYear
  }

  if (
    !user.publicMetadata[PUBLIC_METADATA_KEYS.flowchartId] ||
    typeof user.publicMetadata[PUBLIC_METADATA_KEYS.flowchartId] !== "string"
  ) {
    throw internalServerError(
      "User does not have a flowchart ID assigned.",
      null
    )
  }

  const flowchartId = user.publicMetadata[
    PUBLIC_METADATA_KEYS.flowchartId
  ] as string

  const flowchart = await prisma.flowcharts.findUnique({
    where: {
      FlowchartId: flowchartId,
    },
  })
  if (!flowchart) {
    throw internalServerError("User flowchart key doesn't exist.", null)
  }

  return flowchart.CatalogYear
}
