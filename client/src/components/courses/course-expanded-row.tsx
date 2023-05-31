import React from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { trpc } from "@/lib/trpc"
import CourseCard from "@/components/courses/course-card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface Props {
  courseCode: string
}

const CourseExpandedRow = React.forwardRef<
  React.ComponentRef<typeof TableRow>,
  React.ComponentPropsWithoutRef<typeof TableRow> & Props
>(({ className, courseCode, ...props }, ref) => {
  const course = trpc.courses.course.useQuery({ code: courseCode })

  if (course.isLoading) {
    return <Spinner />
  }

  if (!course.data) {
    return <p>Failed to fetch course data</p>
  }

  return (
    <TableRow
      className={cn(className, "cursor-pointer bg-white hover:bg-white")}
      {...props}
    >
      <TableCell colSpan={8}>
        <CourseCard
          className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down border-none shadow-none"
          course={course.data}
        />
      </TableCell>
    </TableRow>
  )
})
CourseExpandedRow.displayName = "CourseExpandedRow"

export default CourseExpandedRow
