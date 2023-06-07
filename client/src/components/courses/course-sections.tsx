import { columns } from "@/components/courses/course-sections-columns"
import { DataTable } from "@/components/courses/data-table"
import { trpc } from "@/lib/trpc"
import { Sections } from "@prisma/client"

interface Props {
  code: string
  enrollNode: (enrolled: Sections) => React.ReactNode
  quarter?: string
}

export default function CourseSections({ code, enrollNode, quarter }: Props) {
  const sections = trpc.sections.list.useQuery(
    {
      code,
      term: quarter ? parseInt(quarter) : undefined,
    },
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
