import { columns } from "@/components/courses/course-sections-columns"
import { DataTable } from "@/components/courses/data-table"
import { Enrolled, Sections } from "@prisma/client"
import { ArrowLeftRight } from "lucide-react"

interface Props {
  sections: Sections[]
  enrollNode: (enrolled: Sections) => React.ReactNode
}

export default function CourseSections({ sections, enrollNode }: Props) {
  return <DataTable columns={columns(enrollNode)} data={sections} />
}
