import { useState } from "react"
import { Search } from "@/components/ui/search"
import { trpc } from "@/lib/trpc"
import { Spinner } from "@/components/ui/spinner"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { Stars } from "lucide-react"

export default function Courses() {
  const [promptInput, setPromptInput] = useState("")
  const [prompt, setSearch] = useState("")
  const [filterDatabase, setFilterDatabase] = useState(true)
  const explore = trpc.explore.prompt.useQuery({ prompt, filterDatabase }, {
    refetchOnWindowFocus: false,
    retry: false,
  })

  const interestQuestions = [
    "I want a course that integrates physics and computer science.",
    "What are the best courses for learning about machine learning?",
    "What are the best courses for learning about web development?",
  ]

  const interestCards = interestQuestions.map((question) => (
    <div 
      className="mb-3 bg-slate-100 rounded py-3 px-3 border flex gap-3 hover:border hover:border-emerald-500 cursor-pointer"
      key={question}
      onClick={() => {
        setSearch(question); 
        setPromptInput(question)
      }}
    >
      <Stars className="text-emerald-500" />
      { question }
    </div>
  ))

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Search
        placeholder="Ask anything about Cal Poly courses..."
        disabled={explore.isLoading && Boolean(prompt)}
        value={promptInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSearch(e.currentTarget.value)
          }
        }}
        onChange={(e) => {
          setPromptInput(e.currentTarget.value)
          if (!Boolean(e.currentTarget.value)) {
            setSearch("")
          }
        }}
      />
      <div className="h-10 w-full"></div>
      {!Boolean(prompt) ? (
        <>
          <h3 className="mb-5">You might be interested in:</h3>
          { interestCards }
        </>
      ) : explore.data ? (
        <ReactMarkdown>{explore.data}</ReactMarkdown>
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
