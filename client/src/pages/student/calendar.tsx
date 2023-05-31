import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"
import { Enrolled_Type } from "@prisma/client"
import { useEffect, useState } from "react"
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar"

const CURRENT_QUARTER = "Spring 2023" // hard coded for now as placeholder
const HEIGHT_OFFSET = 200

export default function Calendar() {
  const [showingSections, setShowingSections] = useState<Enrolled_Type[]>([
    Enrolled_Type.Enrolled,
  ])
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

  const sections = trpc.home.userSections.useQuery({ types: showingSections })

  const updateShowingSections = (type: Enrolled_Type) => {
    if (showingSections.includes(type)) {
      setShowingSections(showingSections.filter((t) => t !== type))
    } else {
      setShowingSections([...showingSections, type])
    }
    return
  }

  const toggleButtons: [string, Enrolled_Type][] = [
    ["Enrolled", Enrolled_Type.Enrolled],
    ["Waitlisted", Enrolled_Type.Waitlist],
    ["In Shopping Cart", Enrolled_Type.ShoppingCart],
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h1 className="font-bold">{CURRENT_QUARTER}</h1>
        <div className="flex gap-2">
          {toggleButtons.map((entry) => (
            <Button
              key={entry[0]}
              onClick={() => updateShowingSections(entry[1] as Enrolled_Type)}
              className={cn(
                "px-4 w-44 whitespace-nowrap",
                showingSections.includes(entry[1])
                  ? entry[1] === Enrolled_Type.Enrolled
                    ? `bg-green-200 hover:bg-green-300 hover:text-green-800 text-green-800 border border-green-500`
                    : entry[1] === Enrolled_Type.Waitlist
                    ? `bg-amber-200 hover:bg-amber-300 hover:text-amber-800 text-amber-800 border border-amber-500`
                    : `bg-sky-200 hover:bg-sky-300 hover:text-sky-800 text-sky-800 border border-sky-500`
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {entry[0]} {showingSections.includes(entry[1]) ? "✓" : ""}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 mt-2">
        <WeekCalendar
          height={calendarHeight}
          sections={sections.data ? sections.data : []}
          isLoading={sections.isLoading}
          warningMessage={
            showingSections.length === 0
              ? "Please select a section type to view"
              : undefined
          }
        />
      </div>
    </div>
  )
}
