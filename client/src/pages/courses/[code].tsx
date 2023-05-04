import CourseCard from "@/components/courses/CourseCard";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/router";
import Error404 from "../404";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";

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
  }
]

export default function CourseViewer () {
  const router = useRouter()
  const course = trpc.courses.course.useQuery({ code: router.query.code as string })

  const handleRateMyProfessor = () => {
    window.open("https://www.ratemyprofessors.com/search.jsp?query=" + "John Smith", "_blank")
  }

  if (course.isLoading) {
    return <Spinner />
  }

  if (course.error || !course.data) {
    return <Error404 />
  }

  const rows = DummyData.map((row) => (
    <tr key={row.professorName + row.meetingTimes}>
      <td className="px-6 py-4 whitespace-nowrap">{row.professorName}</td>
      <td className="px-6 py-4 whitespace-nowrap">{row.meetingTimes}</td>
      <td className="px-6 py-4 whitespace-nowrap">{row.enrolled}</td>
      <td className="px-6 py-4 whitespace-nowrap">{row.waitlist}</td>
      <td className="px-6 py-4 whitespace-nowrap">{row.classType}</td>
      <td className="px-6 py-4 whitespace-nowrap">{row.modality}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVerticalIcon className="h-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mr-10">
            <DropdownMenuItem onClick={() => handleRateMyProfessor()}>
              <Search className="h-5 mr-2" />
              Rate my professor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  ))

  const headers = [
    "Professor Name",
    "Meeting Times",
    "Enrolled",
    "Waitlist",
    "Class Type",
    "Modality",
    ""
  ].map((header) => (
    <th key={header} className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">{ header }</th>
  ))

  return (
    <div>
      <CourseCard course={course.data} showLink={false} />
      <table className="min-w-full divide-y divide-slate-200 w-full mt-10">
        <thead className="bg-slate-100">
          <tr>
            {headers}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          { rows }
        </tbody>
    </table>
    </div>
  )
}
