import { trpc } from "@/lib/trpc"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useEffect } from "react"

interface Props {
  term?: number
  setTerm: (term?: number) => void
}

export default function TermSelect({ term, setTerm }: Props) {
  const terms = trpc.term.list.useQuery()

  useEffect(() => {
    if (terms.data && term === undefined) {
      setTerm(terms.data[0].TermId)
    }
  }, [terms.data, setTerm])

  return (
    <Select
      value={term?.toString()}
      onValueChange={(t) => setTerm(parseInt(t))}
    >
      <SelectTrigger className="w-[180px] focus-visible:ring-0">
        {terms.isLoading && (
          <div className="animate-pulse flex w-full h-4 rounded bg-slate-200" />
        )}
        <SelectValue placeholder="Spring 2023" />
      </SelectTrigger>
      <SelectContent>
        {terms.data?.map(({ TermId, Year, Season }) => (
          <SelectItem key={TermId} value={TermId.toString()}>
            {Year} {Season}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
