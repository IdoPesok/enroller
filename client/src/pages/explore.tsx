import { useState } from "react"
import { Search } from "@/components/ui/search"
import { trpc } from "@/lib/trpc"
import { Spinner } from "@/components/ui/spinner"

export default function Courses() {
  const [prompt, setSearch] = useState("")
  const explore = trpc.explore.prompt.useQuery({ prompt })

  return (
    <div className="mx-auto max-w-2xl">
      <Search
        placeholder="Ask anything about Cal Poly courses..."
        disabled={explore.isLoading && Boolean(prompt)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSearch(e.currentTarget.value)
          }
        }}
      />
      <div className="h-10 w-full"></div>
      {explore.data ? (
        <>
          {explore.data.split(/\r?\n/).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </>
      ) : (
        explore.isLoading && prompt && <Spinner className="mt-3" />
      )}
      {explore.error && (
        <div className="mt-3">
          <p className="text-red-500">Error: {explore.error.message}</p>
        </div>
      )}
    </div>
  )
}
