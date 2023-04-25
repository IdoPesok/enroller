import { useEffect, useState } from "react"

import { Search } from "@/components/ui/search"
import useDebounce from "@/lib/debounce"
import { Courses } from "@prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export default function Dashboard() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Courses[]>([])
  const [page, setPage] = useState(0)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      const response = await fetch(
        `/api/search?q=${debouncedSearch}&page=${page}`
      )
      if (response.status !== 200) {
        console.error(`failed to fetch courses ${response.status}`)
      }

      setResults(await response.json())
      setLoading(false)
    }

    if (debouncedSearch) {
      fetchCourses()
    }
  }, [debouncedSearch, page])

  return (
    <div className="mx-auto max-w-2xl pt-48 sm:pt-44 lg:pt-44">
      <Search
        placeholder="Search for classes..."
        onChange={(e) => setSearch(e.target.value.trim())}
      />
      {loading ? (
        <Spinner className="mt-3" />
      ) : (
        debouncedSearch &&
        (results.length > 0 ? (
          results.map(({ Code, Name, Description }) => {
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
          })
        ) : (
          <p className={"text-center my-2"}>
            No courses match the specified search criteria
          </p>
        ))
      )}
    </div>
  )
}
