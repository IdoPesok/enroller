import CourseCard from "@/components/courses/CourseCard"
import { columns } from "@/components/courses/columns"
import { DataTable } from "@/components/courses/data-table"
import { Spinner } from "@/components/ui/spinner"
import { trpc } from "@/lib/trpc"
import { useRouter } from "next/router"
import Error404 from "../../404"

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
