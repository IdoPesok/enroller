import { columns } from "@/components/courses/course-sections-columns"
import { DataTable } from "@/components/courses/data-table"
import { trpc } from "@/lib/trpc"
import { Enrolled, Sections } from "@prisma/client"
import { ArrowLeftRight } from "lucide-react"
import { Spinner } from "../ui/spinner"
import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface Props {
  code: string
  enrollNode: (enrolled: Sections) => React.ReactNode
}

export default function CourseSections({ code, enrollNode }: Props) {
  const [quarter, setQuarter] = useState<string | undefined>(undefined)
  const terms = trpc.term.list.useQuery()

  useEffect(() => {
    if (terms.data) {
      setQuarter(terms.data[0].TermId.toString())
    }
  }, [terms.data])

  const sections = trpc.sections.list.useQuery(
    {
      code,
      term: parseInt(quarter!),
    },
    {
      enabled: Boolean(quarter),
    }
  )

  return sections.isError ? (
    <p>failed to fetch sections</p>
  ) : !sections.data ? (
    <Spinner />
  ) : (
    <>
      <Select value={quarter} onValueChange={setQuarter}>
        <SelectTrigger className="w-[180px] focus-visible:ring-0">
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
      <DataTable columns={columns(enrollNode)} data={sections.data} />
    </>
  )
}
