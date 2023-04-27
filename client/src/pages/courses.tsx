import { useEffect, useState } from "react"

import { Search } from "@/components/ui/search"
import { Courses } from "@prisma/client"
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

export default function Dashboard() {
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
    .map(({ Code, Name, Description, MinUnits, MaxUnits }) => {
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
            <CardDescription>{Code}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{Description}</p>
          </CardContent>
        </Card>
      )
    })

  return (
    <div className="mx-auto max-w-2xl pt-24">
      <Search
        placeholder="Search for classes..."
        onChange={(e) =>
          setSearch(
            e.target.value
              .trim()
              .split(/\s+/)
              .filter((w) => !STOPWORDS.has(w.toLowerCase()))
              .map((w) => `+${w}*`)
              .join(" ")
          )
        }
      />
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
        courses.isFetching && <Spinner className="mt-3" />
      )}
    </div>
  )
}
