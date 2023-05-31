import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React, { useState } from "react"
import CourseSearch from "./course-search"
import { ArrowRightLeft } from "lucide-react"
import CourseSwapSearch from "./course-swap-search"
import { Courses, Sections } from "@prisma/client"

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
      <SheetContent size="xl">
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
