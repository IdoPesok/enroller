import { PineconeClient } from "@pinecone-database/pinecone"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { protectedProcedure, router } from "../trpc"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { Configuration, OpenAIApi } from "openai"
import { ScoredVector, VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch"
import PromptBuilder from "@/lib/prompts"

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
        filterDatabase: z.boolean(),
      })
    )
    .query(async ({ input }) => {
      const { prompt, filterDatabase } = input

      if (!client || !pineconeIndex) {
        client = new PineconeClient()
        await client.init({
          apiKey: process.env.PINECONE_API_KEY!,
          environment: process.env.PINECONE_ENVIRONMENT!,
        })
        pineconeIndex = client.Index(process.env.PINECONE_INDEX!)
      }

      if (prompt.length < 5) {
        return null
      }

      let tokensUsed = 0;

      try {
        let filter: object | undefined;

        if (filterDatabase) {
          const filterCompletion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: PromptBuilder.courseFilter(prompt)
          })

          // substring filter completion from first { to last }
          if (filterCompletion.data.choices[0].message !== undefined) {
            const f = filterCompletion.data.choices[0].message["content"]
            const start = f.indexOf("{")
            const end = f.lastIndexOf("}")

            try {
              filter = JSON.parse(f.substring(start, end + 1))
              console.log(filter)
            } catch {
              console.error("Failed to parse filter: " + f)
              filter = undefined;
            }
          }

          tokensUsed += filterCompletion.data.usage?.total_tokens ?? 0;
        }

        /* Embed queries */
        const queryEmbedding = await embeddings.embedQuery(prompt)

        let numTries = 0;
        let matches: ScoredVector[] = []
        while (numTries < 2) {
          numTries += 1;

          // find top 5 most relevant vectors / courses
          try {
            const queryResponse = await pineconeIndex.query({
              queryRequest: {
                namespace: process.env.PINECONE_NAMESPACE,
                topK: 5,
                includeMetadata: true,
                filter,
                vector: queryEmbedding,
              },
            })

            // if no matches are found
            if (queryResponse.matches === undefined || queryResponse.matches.length === 0) {
              // if filters were on, retry again, this time with no filters
              if (filter !== undefined) {
                filter = undefined;
                continue;
              }

              // otherwise no matches were found
              return "No matches found."
            }

            // matches found, continue to next step
            matches = queryResponse.matches;
            break;
          } catch (e) {
            if (filter !== undefined) {
              // filter was probably invalid, try again with no filter
              filter = undefined;
              continue;
            }

            throw e;
          }
        }

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: PromptBuilder.studentCourseQuestion(prompt, matches)
        })

        if (completion.data.choices[0].message === undefined) {
          throw new Error()
        }

        tokensUsed += completion.data.usage?.total_tokens ?? 0;

        // log to user how many tokens were used
        console.log(`Open AI was called, tokens used: ${tokensUsed}`);

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
