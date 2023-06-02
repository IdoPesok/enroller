import React, { useState } from "react"
import { prereqsString } from "@/lib/prereqs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Courses, Enrolled_Type, Sections } from "@prisma/client"
import { Prereq } from "@/interfaces/PrereqTypes"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { trpc } from "@/lib/trpc"
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { Spinner } from "../ui/spinner"
import CourseSections from "./course-sections"

export interface ConfirmSwapData {
  course: Courses
  sectionId: number
}

interface Props {
  course: Courses
  showBorder?: boolean
  confirmSwap: (data: ConfirmSwapData) => void
}

const CourseSwapCard = React.forwardRef<
  React.ComponentRef<typeof Card>,
  React.ComponentPropsWithoutRef<typeof Card> & Props
>(({ course, showBorder = true, confirmSwap }, ref) => {
  const [showSections, setShowSections] = useState(false)
  const sections = trpc.sections.list.useQuery(
    { code: course.Code },
    {
      enabled: showSections,
    }
  )
  const enrolled = trpc.enroll.list.useQuery(undefined, {
    enabled: showSections,
  })

  const { Code, Name, Description, MinUnits, MaxUnits, Prereqs } = course
  const prereqs = Prereqs as unknown as Prereq[] | null

  return (
    <Card 
      ref={ref} 
      className={cn(showBorder ? "my-2" : "border-none shadow-none")} 
      key={Code}
    >
      <CardHeader>
        <CardTitle>
          {Name}
          <span className="text-right font-normal text-base float-right">
            {MinUnits == MaxUnits ? MinUnits : `${MinUnits}-${MaxUnits}`} units
          </span>
        </CardTitle>
        <CardDescription>
          {Code}
          <span className="text-right float-right w-3/5">
            {prereqs ? prereqsString(prereqs) : "No prerequisistes"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{Description}</p>
        <Collapsible open={showSections} onOpenChange={setShowSections}>
          <CollapsibleTrigger className={cn(
            "flex flex-1 items-center justify-center py-1 font-medium transition-all hover:underline pt-5 text-emerald-600",
            showSections && "mb-4"
          )}>
            Choose section
            {!showSections ? <ChevronRight /> : <ChevronDown />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            {sections.isError || enrolled.isError ? (
              <p>failed to fetch sections</p>
            ) : !sections.data || !enrolled.data ? (
              <Spinner />
            ) : (
              <CourseSections
                sections={sections.data}
                enrollNode={({ SectionId }) =>
                  !enrolled.data.some(
                    (enroll) => enroll.SectionId === SectionId
                  ) && (
                    <Button
                      onClick={() => confirmSwap({ course, sectionId: SectionId })}
                    >
                      <ArrowLeftRight size={16} />
                    </Button>
                  )
                }
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
})
CourseSwapCard.displayName = "CourseSwapCard"

export default CourseSwapCard
