import { ScoredVector } from "@pinecone-database/pinecone"
import { ChatCompletionRequestMessage } from "openai"

export default class PromptBuilder {

  static courseFilter = (q: string): ChatCompletionRequestMessage[] => {
    const messages: ChatCompletionRequestMessage[] = [];

    messages.push({ role: "user", content: `
      My courses database index has the following metadata values:

      ["prefix", "number", "minUnits", "maxUnits", "name", "prereqs"],

      name: string (course name e.g. Systems Programming),
      prefix: string (course prefix, e.g. CSC),
      number: number (course number, e.g. 101),
      minUnits: number (minimum units, e.g. 1),
      maxUnits: number (maximum units, e.g. 4),
      prereqs: string (text of course prereqs, e.g. CSC 101 and CSC 225)

      <documentation>
      You must use the query language based on MongoDB's query and projection operators.

      $eq - Equal to (number, string, boolean)
      $ne - Not equal to (number, string, boolean)
      $gt - Greater than (number)
      $gte - Greater than or equal to (number)
      $lt - Less than (number)
      $lte - Less than or equal to (number)
      $in - In array (string or number)
      $nin - Not in array (string or number)

      A valid filter JSON looks like this to filter for CSC 225
      {
        "prefix": {"$eq": "CSC"},
        "number": {"$eq": "225"}
      }
      </documentation>

      Instructions:
      - You will ONLY RETURN the filter JSON.
      - You will try your best only create filters for fields you know
      - Upper division classes have a number >= 300, lower division classes have a number < 300

      Can you please write a valid filter object for the following query.

      ${q}
    `})

    return messages;
  }

  static studentCourseQuestion = (q: string, matches: ScoredVector[]): ChatCompletionRequestMessage[] => {
    const messages: ChatCompletionRequestMessage[] = [];

    messages.push({ role: "system", content: `
      You are a helpful Cal Poly AI chatbot that uses course data to answer student question about courses.

      You will only answer questions about Cal Poly courses. If a question is asked that is not about a course, you should respond with "I don't know, I am a Cal Poly courses AI".
    `})

    messages.push({ role: "user", content: `
      Given the following course data:

      ---
      ${JSON.stringify(matches)}
      ---

      <student_question>
      ${q}
      </student_question>
    `})

    return messages;
  }

}