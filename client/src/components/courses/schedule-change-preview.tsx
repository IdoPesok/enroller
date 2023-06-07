import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import { Enrolled_Type } from "@prisma/client"
import { AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import WeekCalendar from "../WeekCalendar/WeekCalendar"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { SectionWithCourse } from "@/interfaces/SectionTypes"
import { EnrolledWithSection } from "@/interfaces/EnrolledTypes"
import { useAuth } from "@clerk/nextjs"

interface Props {
  oldSectionId?: number
  newSectionId?: number
  onCancel: () => void
  onConfirm: () => void
}

const HEIGHT_OFFSET = 300

export default function ScheduleChangePreview({
  oldSectionId,
  newSectionId,
  onCancel,
  onConfirm,
}: Props) {
  const [calendarHeight, setCalendarHeight] = useState<number>(
    window.innerHeight - HEIGHT_OFFSET
  )

  // watch for resize events and update calendar height
  useEffect(() => {
    const handleResize = () => {
      setCalendarHeight(window.innerHeight - HEIGHT_OFFSET)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const [viewType, setViewType] = useState<"before" | "after">("after")

  const [newSections, setNewSections] = useState<null | EnrolledWithSection[]>(
    null
  )

  const { userId } = useAuth()

  const isCreating = !!newSectionId && !oldSectionId
  const isDropping = !!oldSectionId && !newSectionId
  const isSwapping = !!oldSectionId && !!newSectionId

  const oldSection = trpc.sections.withId.useQuery({ id: oldSectionId })

  const newSection = trpc.sections.withId.useQuery({ id: newSectionId })

  const populateNewSections = (data: EnrolledWithSection[]) => {
    if (data && userId) {
      const temp: EnrolledWithSection[] = [...data]

      if (isCreating && newSection.data) {
        temp.push({
          User: userId,
          SectionId: newSectionId,
          Section: newSection.data,
          Type: Enrolled_Type.Enrolled,
          Seat: null,
        })
      } else if (isDropping && oldSection.data) {
        const index = temp.findIndex(
          (enrolled) => enrolled.SectionId === oldSectionId
        )
        if (index !== -1) {
          temp.splice(index, 1)
        }
      } else if (isSwapping && oldSection.data && newSection.data) {
        const index = temp.findIndex(
          (enrolled) => enrolled.SectionId === oldSectionId
        )
        if (index !== -1) {
          temp[index] = {
            User: userId,
            SectionId: newSectionId,
            Section: newSection.data,
            Type: Enrolled_Type.Enrolled,
            Seat: null,
          }
        }
      }

      setNewSections(temp)
    }
  }

  const enrolledSections = trpc.home.userSections.useQuery(
    {
      types: [
        Enrolled_Type.Enrolled,
        Enrolled_Type.Waitlist,
        Enrolled_Type.ShoppingCart,
      ],
    },
    {
      onSuccess(data) {
        populateNewSections(data)
      },
    }
  )

  return (
    <div className="flex flex-col mt-5">
      <div className="flex justify-between items-center">
        <p className="my-0 flex gap-2">
          <AlertTriangle />
          {isCreating
            ? "Please confirm: your new schedule if you add "
            : isDropping
            ? "Please confirm: your new schedule if you drop "
            : isSwapping
            ? "Please confirm: your new schedule if you swap "
            : ""}
          {isCreating
            ? `${newSection.data?.Courses.Code}(${newSection.data?.SectionId})`
            : isDropping
            ? `${oldSection.data?.Courses.Code}(${oldSection.data?.SectionId})`
            : isSwapping
            ? `${oldSection.data?.Courses.Code}(${oldSection.data?.SectionId}) with ${newSection.data?.Courses.Code}(${newSection.data?.SectionId})`
            : ""}
        </p>
        <Tabs
          dir="ltr"
          value={viewType}
          className="ml-4"
          defaultValue={"before"}
        >
          <TabsList>
            <TabsTrigger value={"before"} onClick={() => setViewType("before")}>
              Before swap
            </TabsTrigger>
            <TabsTrigger value={"after"} onClick={() => setViewType("after")}>
              After swap
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1">
        <WeekCalendar
          height={calendarHeight}
          sections={
            enrolledSections.data && newSections
              ? viewType === "before"
                ? enrolledSections.data
                : newSections
              : []
          }
          isLoading={enrolledSections.isLoading || newSections === null}
        />
      </div>
      <div className="flex justify-end gap-2 w-full mt-10">
        <Button
          className="bg-white-500 text-black hover:bg-slate-100 border border-slate-200"
          onClick={onCancel}
          size={"lg"}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          className="bg-emerald-500 text-white hover:bg-emerald-600"
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </div>
    </div>
  )
}
