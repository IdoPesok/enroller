import { useEffect, useState } from "react"

import { Search } from "@/components/ui/search"
import useDebounce from "@/lib/debounce"
import { Courses } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)

  const [results, setResults] = useState<Courses[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const response = await fetch(`/api/search?q=${debouncedSearch}`);
      if (response.status !== 200) {
        console.error(`failed to fetch courses ${response.status}`)
      }

      setResults(await response.json());
    }

    if (debouncedSearch) {
      fetchCourses()
    }
  }, [debouncedSearch])

  return (
    <div className="mx-auto max-w-2xl pt-48 sm:pt-44 lg:pt-44">
      <Search placeholder="Search for classes..." onChange={(e) => setSearch(e.target.value.trim())} />
      {
        results.map(({ Code, Name, Description }) => {
          return <Card className={cn("my-2")} key={Code}>
            <CardHeader>
              <CardTitle>{Name}</CardTitle>
              <CardDescription>{Code}</CardDescription>
            </CardHeader>
            <CardContent>
              {Description}
            </CardContent>
          </Card>
        })
      }
    </div>
  )
}
