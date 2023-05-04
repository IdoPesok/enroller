import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const waitFor = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// see INFORMATION_SCHEMA.INNODB_FT_DEFAULT_STOPWORD
// NOTE: future improvement could be query this in getStaticProps
// but since we're using the default I just decided to go with this
export const STOPWORDS = new Set([
  "a",
  "about",
  "an",
  "are",
  "as",
  "at",
  "be",
  "by",
  "com",
  "de",
  "en",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "la",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "what",
  "when",
  "where",
  "who",
  "will",
  "with",
  "und",
  "the",
  "www",
])