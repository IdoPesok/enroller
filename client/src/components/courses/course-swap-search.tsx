import { Button } from "@/components/ui/button"
import ScrollToTopButton from "@/components/ui/scroll-to-top"
import { Spinner } from "@/components/ui/spinner"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { STOPWORDS } from "@/lib/utils"
import { SearchToolbar } from "@/components/courses/search-toolbar"
import React from "react"
import CourseSwapCard from "./course-swap-card"
import { Sections } from "@prisma/client"

function addSearchModifiers(search: string): string {
  return search
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .map((w) => `+${w}*`)
    .join(" ")
}

interface Props {
  swapSection: Sections
  setSwapSection: (section?: Sections | null) => void
  search: string
  setSearch: (search: string) => void
  onSwap: () => void
}

export default function CourseSwapSearch({
  swapSection,
  setSwapSection,
  search,
  setSearch,
  onSwap,
}: Props) {
  const debouncedSearch = useDebounce(search, 500)

  const courses = trpc.courses.list.useInfiniteQuery(
    {
      search: addSearchModifiers(debouncedSearch.trim()),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(debouncedSearch),
    }
  )

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map((course) => (
      <CourseSwapCard
        key={course.Code}
        swapSection={swapSection}
        setSwapSection={setSwapSection}
        course={course}
        onSwap={onSwap}
      />
    ))

  return (
    <div className="mx-auto max-w-4xl pt-10">
      <ScrollToTopButton />
      <SearchToolbar search={search} setSearch={setSearch} />
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
