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

  return (
    <div className="mx-auto max-w-2xl pt-24">
      <Search
        placeholder="Search for classes..."
        onChange={(e) =>
          setSearch(
            e.target.value
              .trim()
              .split(/\s+/)
              .map((s) => `+${s}`)
              .join(" ")
          )
        }
      />
      {courses.data ? (
        <>
          {courses.data.pages
            .flatMap(({ courses }) => courses)
            .map(({ Code, Name, Description }) => {
              return (
                <Card className={"my-2"} key={Code}>
                  <CardHeader>
                    <CardTitle>{Name}</CardTitle>
                    <CardDescription>{Code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{Description}</p>
                  </CardContent>
                </Card>
              )
            })}
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
