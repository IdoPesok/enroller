import CourseEnrollCard from "./course-enroll-card"
import { Button } from "@/components/ui/button"
import ScrollToTopButton from "@/components/ui/scroll-to-top"
import { Spinner } from "@/components/ui/spinner"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { STOPWORDS } from "@/lib/utils"
import { SearchToolbar, Filters } from "@/components/courses/search-toolbar"
import { useRouterQueryState } from "@/lib/use-router-query-state"
import { Option } from "@/components/courses/search-filter"
import { ShoppingCart } from "lucide-react"
import React from "react"

function addSearchModifiers(search: string): string {
  return search
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .map((w) => `+${w}*`)
    .join(" ")
}

interface Props {
  search: string
  setSearch: (search: string) => void
  filters?: Filters
}

export default function CourseSearch({ search, setSearch, filters }: Props) {
  const debouncedSearch = useDebounce(search, 500)

  const courses = trpc.courses.list.useInfiniteQuery(
    {
      search: addSearchModifiers(debouncedSearch.trim()),
      filters: {
        prefixes: filters?.prefixes,
      },
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(debouncedSearch),
    }
  )

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map((course) => <CourseEnrollCard key={course.Code} course={course} />)

  return (
    <div className="mx-auto max-w-4xl pt-10">
      <ScrollToTopButton />
      <SearchToolbar search={search} setSearch={setSearch} filters={filters} />
      {cards ? (
        <>
          {cards.length > 0 ? (
            cards
          ) : (
            <p className="text-center mt-3">No courses meet search criteria</p>
          )}
          {courses.hasNextPage && (
            <Button
              className="w-full mt-6"
              onClick={() => courses.fetchNextPage()}
            >
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
