import { useEffect, useState } from "react"

import { Search } from "@/components/ui/search"
import { Courses, Prisma } from "@prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { trpc } from "@/lib/trpc"
import useDebounce from "@/lib/debounce"
import { Button } from "@/components/ui/button"
import ScrollToTopButton from "@/components/ui/scroll-to-top"

// see INFORMATION_SCHEMA.INNODB_FT_DEFAULT_STOPWORD
// NOTE: future improvement could be query this in getStaticProps
// but since we're using the default I just decided to go with this
const STOPWORDS = new Set([
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

export default function Courses() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const courses = trpc.courses.list.useInfiniteQuery(
    { search: debouncedSearch },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!debouncedSearch,
    }
  )

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map(({ Code, Name, Description, MinUnits, MaxUnits, Prereqs }) => {
      const prereqs = Prereqs as unknown as Prereq[] | null
      return (
        <Card className={"my-2"} key={Code}>
          <CardHeader>
            <CardTitle>
              {Name}
              <span className="text-right font-normal text-base float-right">
                {MinUnits == MaxUnits ? MinUnits : `${MinUnits}-${MaxUnits}`}{" "}
                units
              </span>
            </CardTitle>
            <CardDescription>
              {Code}
              <span className="text-right float-right">
                {prereqs ? prereqsString(prereqs) : "No prerequisistes"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{Description}</p>
          </CardContent>
        </Card>
      )
    })

  return (
    <div className="mx-auto max-w-2xl">
      <ScrollToTopButton />
      <Search
        placeholder="Search for classes..."
        onChange={(e) =>
          setSearch(
            e.target.value
              .trim()
              .split(/\s+/)
              .filter((w) => !STOPWORDS.has(w.toLowerCase()) && w.length > 0)
              .map((w) => `+${w}*`)
              .join(" ")
          )
        }
      />
      <div className="h-10 w-full"></div>
      {cards ? (
        <>
          {cards.length > 0 ? (
            cards
          ) : (
            <p className="text-center mt-3">No courses meet search criteria</p>
          )}
          {courses.hasNextPage && (
            <Button className="w-full" onClick={() => courses.fetchNextPage()}>
              Load More
            </Button>
          )}
        </>
      ) : (
        (courses.isFetching && search) && <Spinner className="mt-3" />
      )}
    </div>
  )
}
