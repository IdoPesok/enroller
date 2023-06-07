import CourseCard from "@/components/courses/course-card"
import SkeletonCourseCard from "@/components/courses/skeleton-course-card"
import ErrorMessage from "@/components/ui/error-message"
import { trpc } from "@/lib/trpc"

export default function DegreeProgress() {
  const courses = trpc.degreeProgress.graduationRequirementCourses.useQuery()

  if (courses.isLoading) {
    return <SkeletonCourseCard />
  }

  if (courses.error || !courses.data) {
    return (
      <ErrorMessage
        message={courses.error.message + JSON.stringify(courses.error.data)}
      />
    )
  }

  return (
    <div>
      {courses.data.map((course) => (
        <CourseCard course={course} key={course.Code} className="my-2" />
      ))}
    </div>
  )
}
