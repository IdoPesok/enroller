import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Courses, Sections } from "@prisma/client"
import { useState } from "react"
import CourseSwapSearch from "./course-swap-search"

interface Props {
  course?: Courses | null
  section?: Sections | null
  setSection: (swap?: Sections | null) => void
  onSwap: () => void
}

export default function SwapSheet({
  course,
  section,
  setSection,
  onSwap,
}: Props) {
  const [search, setSearch] = useState("")

  return (
    <Sheet
      open={Boolean(section)}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setSection(null)
        }
      }}
    >
      <SheetContent size="xl" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Course Swap</SheetTitle>
          <SheetDescription>
            Choose course that you want to swap {course?.Code} with
          </SheetDescription>
        </SheetHeader>
        {section && (
          <CourseSwapSearch
            swapSection={section}
            setSwapSection={setSection}
            search={search}
            setSearch={setSearch}
            onSwap={onSwap}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
