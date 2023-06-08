import React from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { trpc } from "@/lib/trpc"
import CourseCard from "@/components/courses/course-card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import SkeletonCourseCard from "./skeleton-course-card"
import ErrorMessage from "../ui/error-message"

interface Props {
  courseCode: string
  columnCount: number
}

const CourseExpandedRow = React.forwardRef<
  React.ComponentRef<typeof TableRow>,
  React.ComponentPropsWithoutRef<typeof TableRow> & Props
>(({ className, courseCode, columnCount, ...props }, ref) => {
  const course = trpc.courses.course.useQuery({ code: courseCode })

  return (
    <TableRow
      className={cn(className, "cursor-pointer bg-white hover:bg-white")}
      {...props}
    >
      <TableCell colSpan={columnCount - 1}>
        {course.isLoading ? (
          <SkeletonCourseCard className="border-0" descriptionRowCount={2} />
        ) : course.error || !course.data ? (
          <ErrorMessage message="Failed to fetch course data" />
        ) : (
          <CourseCard
            className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down border-none shadow-none"
            course={course.data}
          />
        )}
      </TableCell>
    </TableRow>
  )
})
CourseExpandedRow.displayName = "CourseExpandedRow"

export default CourseExpandedRow
