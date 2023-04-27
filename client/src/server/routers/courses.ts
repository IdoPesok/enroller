import { prisma } from "@/server/prisma";
import { PineconeClient } from "@pinecone-database/pinecone";
import { TRPCError } from "@trpc/server";
import * as dotenv from "dotenv";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

export const courseRouter = router({
  explore: protectedProcedure
    .input(
      z.object({
        search: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { search } = input

      if (
        !process.env.OPENAI_API_KEY || 
        !process.env.PINECONE_API_KEY || 
        !process.env.PINECONE_INDEX ||
        !process.env.PINECONE_ENVIRONMENT
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Missing API keys",
        });
      }

      if (search.length < 5) {
        return null;
      }

      const client = new PineconeClient();
      await client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
      });
      const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

      try {
        // get embedding from open ai
        const embeddings = new OpenAIEmbeddings();
        /* Embed queries */
        const queryEmbedding = await embeddings.embedQuery(search);

        const queryResponse = await pineconeIndex.query({
          queryRequest: {
            namespace: process.env.PINECONE_NAMESPACE,
            topK: 15,
            includeMetadata: true,
            vector: queryEmbedding,
          },
        });

        const prompt = `
          Given the following course data:

          ---
          ${JSON.stringify(queryResponse.matches)}
          ---

          ${search}
        `

        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: "You are a helpful AI chatbot that answers student questions about courses. You will only answer questions about courses or curriculum."},
            {role: "user", content: prompt}
          ],
        });

        if (completion.data.choices[0].message === undefined) {
          throw new Error();
        }

        return completion.data.choices[0].message['content'];
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to query vector database",
          cause: JSON.stringify(e)
        });
      }
    }),
  list: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const PER_PAGE = 20
      const limit = input.limit ?? PER_PAGE
      const { search, cursor } = input

      const courses = await prisma.courses.findMany({
        where: {
          Code: {
            search,
          },
          Name: {
            search,
          },
        },
        orderBy: {
          _relevance: {
            fields: ["Code", "Name"],
            search,
            sort: "asc",
          },
        },
        take: limit + 1,
        cursor: cursor ? { Code: cursor } : undefined,
      })
      let nextCursor: string | undefined = undefined
      if (courses.length > limit) {
        const nextCourses = courses.pop()
        nextCursor = nextCourses!.Code
      }

      return { courses, nextCursor }
    }),
})

export type AppRouter = typeof courseRouter
