require("dotenv").config();
const mysql = require('mysql2/promise');
const { Configuration, OpenAIApi } = require("openai");
import { PineconeClient } from "@pinecone-database/pinecone";
import { Buffer } from 'buffer';

interface Course {
  Code: string;
  Prefix: string;
  Number: number;
  MinUnits: number;
  MaxUnits: number;
  Name: string;
  Description: string;
  Prereqs: Record<string, unknown>[];
}

interface CourseWithEmbedding extends Course {
  Embedding: number[];
}

async function getEmbeddings(courses: Course[]): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("missing pinecone api key");
    process.exit();
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: courses.map((c) => JSON.stringify(c)),
  });

  return response['data']['data'].map((d: any) => d['embedding']);
}

async function insertIntoPinecone(courses: Course[], deleteAll = 0) {
  const pinecone = new PineconeClient();

  const embeddings = await getEmbeddings(courses);

  const coursesWithEmbeddings: CourseWithEmbedding[] = [];
  for (let i = 0; i < embeddings.length; i++) {
    coursesWithEmbeddings.push({
      ...courses[i],
      Embedding: embeddings[i],
    });
  }

  if (!process.env.PINECONE_API_KEY) {
    console.error("missing pinecone api key");
    process.exit();
  }

  await pinecone.init({
    environment: "us-west1-gcp-free",
    apiKey: process.env.PINECONE_API_KEY,
  });

  const INDEX_NAME = "courses";
  const NAMESPACE = "courses";

  const index = await pinecone.Index(INDEX_NAME);

  if (deleteAll === 1) {
    await index.delete1({
      deleteAll: true,
      namespace: NAMESPACE,
    });
  }

  const upsertRequest = {
    vectors: coursesWithEmbeddings.map((c) => {
      return {
        id: Buffer.from(c.Code).toString('base64'),
        values: c.Embedding,
        metadata: {
          name: c.Name,
          code: c.Code,
          description: c.Description,
          prefix: c.Prefix,
          number: c.Number,
          minUnits: c.MinUnits,
          maxUnits: c.MaxUnits,
          prereqs: JSON.stringify(c.Prereqs),
        },
      };
    }),
    namespace: NAMESPACE
  };

  await index.upsert({ upsertRequest });

  console.log(`inserted ${courses.length} courses into pinecone index ${INDEX_NAME}`)
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("missing database url");
    process.exit();
  }

  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      debug: false,
    });

    // get all rows in Courses table
    const [rows, fields] = await connection.execute('SELECT * FROM `Courses`');

    // insert into pinecone, 50 rows at a time
    for (let i = 0; i < rows.length; i += 50) {
      await insertIntoPinecone(rows.slice(i, i + 50) as Course[], i === 0 ? 1 : 0);
    }

    await connection.end();
  } catch (e) {
    console.error(e);
    process.exit();
  }
}

main();
