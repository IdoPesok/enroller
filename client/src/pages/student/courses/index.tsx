import { useState } from "react"

import CourseCard from "@/components/courses/course-card"
import { Button } from "@/components/ui/button"
import ScrollToTopButton from "@/components/ui/scroll-to-top"
import { Search } from "@/components/ui/search"
import { Spinner } from "@/components/ui/spinner"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { STOPWORDS } from "@/lib/utils"
import {
  Option,
  SearchFilterCombobox,
} from "@/components/courses/search-filter"
import { prisma } from "@/server/prisma"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import { SearchToolbar } from "@/components/courses/search-toolbar"
import { useRouterQueryState } from "@/lib/use-router-query-state"

function addSearchModifiers(search: string): string {
  return search
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .map((w) => `+${w}*`)
    .join(" ")
}

export default function Courses({
  prefixOptions,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [search, setSearch] = useRouterQueryState("q", "")
  const [prefixes, setPrefixes] = useRouterQueryState<string[] | undefined>("p")
  const debouncedSearch = useDebounce(search, 500)

  const courses = trpc.courses.list.useInfiniteQuery(
    {
      search: addSearchModifiers(debouncedSearch.trim()),
      filters: { prefixes },
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(debouncedSearch),
    }
  )

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map((course) => <CourseCard key={course.Code} course={course} />)

  return (
    <div className="mx-auto max-w-4xl pt-10">
      <ScrollToTopButton />
      <SearchToolbar
        search={search}
        setSearch={setSearch}
        prefixOptions={prefixOptions}
        prefixes={prefixes}
        setPrefixes={setPrefixes}
      />
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

export const getStaticProps: GetStaticProps<{
  prefixOptions: Option[]
}> = async () => {
  const courses = await prisma.courses.findMany({
    select: {
      Prefix: true,
    },
    distinct: ["Prefix"],
  })
  const prefixes = courses.map(({ Prefix }) => Prefix)
  const prefixOptions = prefixes.map((prefix) => ({
    label: prefix,
    value: prefix.toLowerCase(),
  }))

  return {
    props: {
      prefixOptions,
    },
  }
}
