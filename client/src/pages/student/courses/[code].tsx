import CourseCard from "@/components/courses/CourseCard"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableHeader } from "@/components/ui/table"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/router"
import Error404 from "../../404"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search } from "lucide-react"
import { DataTable } from "@/components/courses/data-table"
import { columns } from "@/components/courses/columns"

const DummyData = [
  {
    professorName: "Prof. John Doe",
    meetingTimes: "MWF 10:10 - 11:00",
    enrolled: "50 / 50",
    waitlist: "3",
    classType: "Lecture",
    modality: "In-Person",
  },
  {
    professorName: "Dr. Jane Smith",
    meetingTimes: "TuTh 14:10 - 17:00",
    enrolled: "10 / 50",
    waitlist: "0",
    classType: "Seminar",
    modality: "Online",
  },
]

export default function CourseViewer() {
  const router = useRouter()
  const course = trpc.courses.withSections.useQuery({
    code: router.query.code as string,
  })

  if (course.isLoading) {
    return <Spinner />
  }

  if (course.error || !course.data) {
    return <Error404 />
  }

  return (
    <div>
      <CourseCard course={course.data} showLink={false} />
      <DataTable columns={columns} data={course.data.Sections} />
    </div>
  )
}
