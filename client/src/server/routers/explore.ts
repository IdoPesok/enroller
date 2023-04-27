import { PineconeClient } from "@pinecone-database/pinecone"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { protectedProcedure, router } from "../trpc"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { Configuration, OpenAIApi } from "openai"
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch"

// these can get rebuilt a ton in development see prisma stuff
// I can't be bothered to fix it
const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
  PINECONE_API_KEY: z.string(),
  PINECONE_INDEX: z.string(),
  PINECONE_ENVIRONMENT: z.string(),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(env.error.format(), null, 4)
  )
  process.exit(1)
}

// requires async
let client: PineconeClient | null = null
let pineconeIndex: VectorOperationsApi | null = null

const embeddings = new OpenAIEmbeddings()
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const exploreRouter = router({
  prompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { prompt: search } = input

      if (!client || !pineconeIndex) {
        client = new PineconeClient()
        await client.init({
          apiKey: process.env.PINECONE_API_KEY!,
          environment: process.env.PINECONE_ENVIRONMENT!,
        })
        pineconeIndex = client.Index(process.env.PINECONE_INDEX!)
      }

      if (search.length < 5) {
        return null
      }

      try {
        // get embedding from open ai
        /* Embed queries */
        const queryEmbedding = await embeddings.embedQuery(search)

        const queryResponse = await pineconeIndex.query({
          queryRequest: {
            namespace: process.env.PINECONE_NAMESPACE,
            topK: 15,
            includeMetadata: true,
            vector: queryEmbedding,
          },
        })

        const prompt = `
          Given the following course data:

          ---
          ${JSON.stringify(queryResponse.matches)}
          ---

          ${search}
        `

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI chatbot that answers student questions about courses. You will only answer questions about courses or curriculum.",
            },
            { role: "user", content: prompt },
          ],
        })

        if (completion.data.choices[0].message === undefined) {
          throw new Error()
        }

        return completion.data.choices[0].message["content"]
      } catch (e) {
        console.error(e)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to query vector database",
          cause: JSON.stringify(e),
        })
      }
    }),
})

export type ExploreRouter = typeof exploreRouter
