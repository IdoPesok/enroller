import { columns } from "@/components/courses/course-sections-columns"
import { DataTable } from "@/components/courses/data-table"
import { trpc } from "@/lib/trpc"
import { Sections } from "@prisma/client"

interface Props {
  code: string
  enrollNode: (enrolled: Sections) => React.ReactNode
  quarter: string | undefined
}

export default function CourseSections({ code, enrollNode, quarter }: Props) {
  const sections = trpc.sections.list.useQuery(
    {
      code,
      term: parseInt(quarter!),
    },
    {
      enabled: Boolean(quarter),
    }
  )

  return (
    <>
      <DataTable
        columns={columns(enrollNode)}
        data={sections.data ?? []}
        isLoading={sections.isLoading}
        isError={sections.isError}
        errorMessage="Failed to fetch sections"
      />
    </>
  )
}
