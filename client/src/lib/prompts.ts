import { ScoredVector } from "@pinecone-database/pinecone"
import { ChatCompletionRequestMessage } from "openai"

export default class PromptBuilder {
  static courseFilter = (q: string): ChatCompletionRequestMessage[] => {
    const messages: ChatCompletionRequestMessage[] = []

    messages.push({
      role: "user",
      content: `
      My courses database index has the following metadata values:

      ["prefix", "number", "minUnits", "maxUnits", "name", "prereqs"],

      name: string (course name e.g. Systems Programming),
      prefix: string (course prefix, e.g. CSC),
      number: number (course number, e.g. 101),
      minUnits: number (minimum units, e.g. 1),
      maxUnits: number (maximum units, e.g. 4),
      prereqs: string (text of course prereqs, e.g. CSC 101 and CSC 225)

      <documentation>
      Pinecone Query API

      Pinecone's filtering query language is based on MongoDB's query and projection operators. We currently support a subset of those selectors.

      Available projection operators:
      $eq - Equal to (number, string, boolean)
      $ne - Not equal to (number, string, boolean)
      $gt - Greater than (number)
      $gte - Greater than or equal to (number)
      $lt - Less than (number)
      $lte - Less than or equal to (number)
      $in - In array (string or number)
      $nin - Not in array (string or number)

      Not supported projection operators:
      $exists - Exists (boolean)
      $regex - Regular expression (string)
      $size - Size of array (number)
      etc.

      A valid filter JSON looks like this to filter for CSC 225:
      {
        "prefix": {"$eq": "CSC"},
        "number": {"$eq": "225"}
      }

      A physics class or a computer science class:
      {
        "prefix": { "$in": ["PHYS", "CSC"] }
      }

      An uppper division CSC class:
      {
        "prefix": { "$eq": "CSC" },
        "number": { "$gte": 300 }
      }

      An uppper division CSC class (equivalent to the previous example):
      {
        "$and": [{ "prefix": { "$eq": "CSC" } }, { "number": { "$gte": 300 } }]
      }

      I want a physics class that also does coding:
      I cannot create a filter for this using the available projection operators.
      </documentation>

      Instructions:
      - You will ONLY RETURN the filter JSON.
      - You will only use available projection operators.
      - You will try your best only create filters for fields you know
      - Upper division classes have a number >= 300, lower division classes have a number < 300

      Can you please write a valid filter object for the following query.

      ${q}
    `,
    })

    return messages
  }

  static studentCourseQuestion = (
    q: string,
    matches: ScoredVector[]
  ): ChatCompletionRequestMessage[] => {
    const messages: ChatCompletionRequestMessage[] = []

    messages.push({
      role: "system",
      content: `
      You are a helpful Cal Poly AI chatbot that uses course data to answer student question about courses.

      You will only answer questions about Cal Poly courses. If a question is asked that is not about a course, you should respond with "I don't know, I am a Cal Poly courses AI".
    `,
    })

    messages.push({
      role: "user",
      content: `
      <course_data>
      ${JSON.stringify(matches)}
      </course_data>

      <student_question>
      ${q}
      </student_question>

      Use the course data above to respond to the student question. Be concise and correct. If you don't know the answer, respond with "I don't know, I am a Cal Poly courses AI".

      Response:`
    })

    return messages
  }
}
