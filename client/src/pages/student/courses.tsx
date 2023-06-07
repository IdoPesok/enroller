import { Button } from "@/components/ui/button"
import ScrollToTopButton from "@/components/ui/scroll-to-top"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { addSearchModifiers } from "@/lib/utils"
import { Option } from "@/components/courses/search-filter"
import { prisma } from "@/server/prisma"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import { SearchToolbar } from "@/components/courses/search-toolbar"
import { useRouterQueryState } from "@/lib/use-router-query-state"
import CourseEnrollCard from "@/components/courses/course-enroll-card"
import SkeletonCourseCard from "@/components/courses/skeleton-course-card"

export default function Courses({
  prefixOptions,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [search, setSearch] = useRouterQueryState("q", "")
  const [prefixes, setPrefixes] = useRouterQueryState<string[] | undefined>(
    "p",
    undefined,
    {
      serializer: (value) => value.join(","),
      deserializer: (value) => value.split(","),
    }
  )

  const debouncedSearch = useDebounce(search, 500)
  const courses = trpc.courses.list.useInfiniteQuery(
    {
      search: addSearchModifiers(debouncedSearch.trim()),
      filters: {
        prefixes,
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
      <SearchToolbar
        search={search}
        setSearch={setSearch}
        filters={{ prefixOptions, prefixes, setPrefixes }}
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
              className="w-full mt-6 mb-10"
              onClick={() => courses.fetchNextPage()}
            >
              Load More
            </Button>
          )}
        </>
      ) : (
        courses.isFetching && search && <SkeletonCourseCard />
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
