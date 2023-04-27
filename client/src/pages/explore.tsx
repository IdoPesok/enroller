import { useState } from "react"

import { Search } from "@/components/ui/search"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { Spinner } from "@/components/ui/spinner"

export default function Courses() {
  const [search, setSearch] = useState("")
  const courses = trpc.courses.explore.useQuery(
    { search },
  )

  return (
    <div className="mx-auto max-w-2xl">
      <Search
        placeholder="Ask anything about Cal Poly courses..."
        disabled={courses.isLoading && Boolean(search)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSearch(e.currentTarget.value)
          }
        }
        }
      />
      <div className="h-10 w-full"></div>
      {
        courses.data ? (
          <>
            { JSON.stringify(courses.data) }
          </>
        ) : (
          (courses.isLoading && search) && <Spinner className="mt-3" />
        )
      }
      {
        courses.error && (
          <div className="mt-3">
            <p className="text-red-500">Error: {courses.error.message}</p>
          </div>
        )
      }
    </div>
  )
}
