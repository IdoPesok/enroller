import { useState } from "react"

import CourseCard from "@/components/courses/CourseCard"
import { Button } from "@/components/ui/button"
import ScrollToTopButton from "@/components/ui/scroll-to-top"
import { Search } from "@/components/ui/search"
import { Spinner } from "@/components/ui/spinner"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { STOPWORDS } from "@/lib/utils"


export default function Courses() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const courses = trpc.courses.list.useInfiniteQuery(
    { search: debouncedSearch },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(debouncedSearch),
    }
  )

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map((course) => <CourseCard key={course.Code} course={course} />)

  return (
    <div className="mx-auto max-w-2xl py-10">
      <ScrollToTopButton />
      <Search
        placeholder="Search for classes..."
        onChange={(e) =>
          setSearch(
            e.target.value
              .trim()
              .split(/\s+/)
              .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
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
            <Button className="w-full mt-6" onClick={() => courses.fetchNextPage()}>
              Load More
            </Button>
          )}
        </>
      ) : (
        courses.isFetching && search && <Spinner className="mt-3" />
      )}
    </div>
  )
}
