require("dotenv").config();
const mysql = require('mysql2/promise');
const { Configuration, OpenAIApi } = require("openai");
import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from 'uuid';

interface Course {
  Code: string;
  Prefix: string;
  Number: number;
  MinUnits: number;
  MaxUnits: number;
  Name: string;
  Description: string;
  Prereqs: Prereq[] | null;
}

interface CourseWithEmbedding extends Course {
  Embedding: number[];
}

enum PrereqType {
  And = "and",
  Or = "or",
  Prerequisite = "prerequisite",
  Corequisite = "corequisite",
  Reccomended = "reccomended",
  Concurrent = "concurrent",
}

enum PrereqOpType {
  And = "and",
  Or = "or",
}

interface Prereq {
  type: PrereqType | PrereqOpType
}

interface PrereqOp extends Prereq {
  type: PrereqOpType
  children: Prereq[]
}

interface PrereqLeaf extends Prereq {
  code: string
  type: PrereqType
}

function prereqString(prereq: Prereq, depth: number = 0): string | undefined {
  if (Object.values(PrereqOpType).includes(prereq.type as PrereqOpType)) {
    const prereqOp = prereq as PrereqOp
    const format = prereqOp.children
      .map((p) => prereqString(p, depth + 1))
      .join(` ${prereqOp.type} `)
    return depth > 0 ? `(${format})` : format
  } else {
    const prereqLeaf = prereq as PrereqLeaf
    return prereqLeaf.code
  }
}

function prereqsString(prereqs: Prereq[] | null) {
  if (prereqs === null) {
    return null
  }
  return prereqs.map(prereqString).join(" ")
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

  const getCourseDocument = (course: Course) => {
    return `Name: ${course.Name}, Code: (${course.Code})\n\nDescription: ${course.Description}\n\nPrerequisites: ${course.Prereqs ? prereqsString(course.Prereqs) : "No prerequisistes"}\n\nUnits: ${course.MinUnits}-${course.MaxUnits}`;
  };

  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: courses.map((c) => getCourseDocument(c)),
  });

  return response['data']['data'].map((d: any) => d['embedding']);
}

async function insertIntoPinecone(pinecone: PineconeClient, courses: Course[], deleteAll = 0) {

  const embeddings = await getEmbeddings(courses);

  const coursesWithEmbeddings: CourseWithEmbedding[] = [];
  for (let i = 0; i < embeddings.length; i++) {
    coursesWithEmbeddings.push({
      ...courses[i],
      Embedding: embeddings[i],
    });
  }

  if (!process.env.PINECONE_INDEX_NAME || !process.env.PINECONE_NAMESPACE) {
    console.error("missing pinecone api key");
    process.exit();
  }

  const index = await pinecone.Index(process.env.PINECONE_INDEX_NAME);

  if (deleteAll === 1) {
    await index.delete1({
      deleteAll: true,
      namespace: process.env.PINECONE_NAMESPACE,
    });
  }

  const upsertRequest = {
    vectors: coursesWithEmbeddings.map((c) => {
      return {
        id: uuidv4(),
        values: c.Embedding,
        metadata: {
          name: c.Name,
          code: c.Code,
          description: c.Description,
          prefix: c.Prefix,
          number: c.Number,
          minUnits: c.MinUnits,
          maxUnits: c.MaxUnits,
          prereqs: c.Prereqs ? prereqsString(c.Prereqs) : "No prerequisistes"
        },
      };
    }),
    namespace: process.env.PINECONE_NAMESPACE,
  };

  await index.upsert({ upsertRequest });

  console.log(`inserted ${courses.length} courses into pinecone index "${process.env.PINECONE_INDEX_NAME}"`);
}

async function createPineconeIndex(pinecone: PineconeClient) {
  if (!process.env.PINECONE_INDEX_NAME) {
    console.error("missing pinecone api key");
    process.exit();
  }

  try {
    await pinecone.deleteIndex({
      indexName: process.env.PINECONE_INDEX_NAME,
    });

    // sleep 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch {
    // ignore
  }

  await pinecone.createIndex({
    createRequest: {
      name: process.env.PINECONE_INDEX_NAME,
      dimension: 1536,
      metadataConfig: {
        indexed: ["code", "prefix", "number", "minUnits", "maxUnits", "name", "prereqs"],
      },  
    }
  });

  console.log("initializing pinecone index")
  await new Promise((resolve) => setTimeout(resolve, 10000));
}

async function main() {
  if (!process.env.DATABASE_URL || !process.env.PINECONE_API_KEY) {
    console.error("missing database url");
    process.exit();
  }

  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      debug: false,
    });

    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: "us-west1-gcp-free",
      apiKey: process.env.PINECONE_API_KEY,
    });

    // ONLY USE THIS IF YOU WANT TO RECREATE THE PINECONE INDEX
    // await createPineconeIndex(pinecone);

    // get all rows in Courses table
    const [rows, fields] = await connection.execute('SELECT * FROM `Courses`');

    // insert into pinecone, 50 rows at a time
    for (let i = 0; i < rows.length; i += 50) {
      await insertIntoPinecone(pinecone, rows.slice(i, i + 50) as Course[], i === 0 ? 1 : 0);
    }

    await connection.end();
  } catch (e) {
    console.error(e);
    process.exit();
  }
}

main();
