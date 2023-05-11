import { PUBLIC_METADATA_KEYS } from "@/interfaces/PublicMetadata"
import { internalServerError } from "@/lib/trpc"
import { prisma } from "@/server/prisma"
import { clerkClient } from '@clerk/nextjs'
import { z } from "zod"
import { onboardProcedure, router } from "../trpc"

export const onboardRouter = router({
  catalogs: onboardProcedure
    .query(async () => {
      // select all catalogs from prisma
      return await prisma.catalogs.findMany({
        orderBy: {}
      })
    }),
  majors: onboardProcedure
    .input(z.object({ catalogYear: z.string().nullish() }))
    .query(async ({ input }) => {
      if (!input.catalogYear) {
        return []
      }

      const majorIdsFromCatalogYear = await prisma.flowcharts.findMany({
        where: {
          CatalogYear: input.catalogYear
        },
        select: {
          MajorId: true
        }
      })

      const majorIds = majorIdsFromCatalogYear.map(major => major.MajorId)

      // return all majors with the ids from the catalog year
      return await prisma.majors.findMany({
        where: {
          Id: {
            in: majorIds
          }
        },
        orderBy: {
          Name: "asc"
        }
      })
    }),
  concentrations: onboardProcedure
    .input(z.object({ 
      catalogYear: z.string().nullish(),
      majorId: z.string().nullish(),
    }))
    .query(async ({ input }) => {
      if (!input.catalogYear || !input.majorId) {
        return []
      }

      const concentrations = await prisma.flowcharts.findMany({
        where: {
          AND: [
            {
              CatalogYear: input.catalogYear
            },
            {
              MajorId: input.majorId
            }
          ]
        },
        select: {
          ConcentrationId: true
        }
      })

      const concentrationIds = concentrations.map(concentration => concentration.ConcentrationId)

      // return all concentrations with the ids from the catalog year
      return await prisma.concentrations.findMany({
        where: {
          AND: [
            {
              Id: {
                in: concentrationIds
              }
            },
            {
              MajorId: input.majorId
            }
          ]
        },
        orderBy: {
          Name: "asc"
        }
      })
    }),
  saveUserFlowchart: onboardProcedure
    .input(z.object({ 
      catalogYear: z.string().nullish(),
      majorId: z.string().nullish(),
      concentrationId: z.string().nullish(),
    }))
    .mutation(async ({ input, ctx }) => {
      const getFlowchart = async () => {
        if (!input.catalogYear || !input.majorId || !input.concentrationId) {
          return false
        }

        return await prisma.flowcharts.findFirst({
          where: {
            AND: [
              {
                CatalogYear: input.catalogYear
              },
              {
                MajorId: input.majorId
              },
              {
                ConcentrationId: input.concentrationId
              }
            ]
          },
          select: {
            FlowchartId: true
          }
        })
      }

      const updateUserData = async (flowchartId: string) => {
        const user = await clerkClient.users.getUser(ctx.auth.userId);
        await clerkClient.users.updateUser(
          ctx.auth.userId,
          {
            publicMetadata: {
              ...user.publicMetadata,
              [PUBLIC_METADATA_KEYS.onboarding]: true,
              [PUBLIC_METADATA_KEYS.flowchartId]: flowchartId
            }
          }
        )
      }

      // find the flowchart id
      try {
        const flowchart = await getFlowchart()
        if (!flowchart) {
          throw new Error();
        }

        // update the user's metadata
        try {
          await updateUserData(flowchart.FlowchartId)

          return true;
        } catch (e) {
          throw internalServerError("Failed to save user metadata", e)
        }
      } catch (e) {
        throw internalServerError("Failed to find the flowchart", e)
      }
    }),
})

export type AppRouter = typeof onboardRouter
