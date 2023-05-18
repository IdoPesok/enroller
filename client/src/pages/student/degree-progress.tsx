import CourseCard from "@/components/courses/course-card";
import ErrorMessage from "@/components/ui/error-message"
import { Spinner } from "@/components/ui/spinner"
import { trpc } from "@/lib/trpc"

export default function DegreeProgress() {
  const courses = trpc.degreeProgress.graduationRequirementCourses.useQuery();

  if (courses.isLoading) {
    return <Spinner />
  }

  if (courses.error || !courses.data) {
    return <ErrorMessage message={courses.error.message + JSON.stringify(courses.error.data)} />
  }

  return (
    <div>
      {
        courses.data.map((course) => (
          <CourseCard course={course} key={course.Code} />
        ))
      }
    </div>
  )
}
