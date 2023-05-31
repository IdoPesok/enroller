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
  ChevronUp,
  Loader2,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { Spinner } from "../ui/spinner"
import CourseSections from "./course-sections"
import { useAuth } from "@clerk/nextjs"

interface Props {
  course: Courses
  swapSection: Sections
  setSwapSection: (section?: Sections | null) => void
  showBorder?: boolean
  onSwap: () => void
}

const CourseSwapCard = React.forwardRef<
  React.ComponentRef<typeof Card>,
  React.ComponentPropsWithoutRef<typeof Card> & Props
>(({ course, swapSection, setSwapSection, showBorder = true, onSwap }, ref) => {
  const { userId } = useAuth()
  const utils = trpc.useContext()
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

  const updateMutation = trpc.enroll.update.useMutation({
    onMutate: async (updatedEnroll) => {
      await utils.enroll.list.cancel()
      const oldEnrolls = utils.enroll.list.getData()
      const oldSection = swapSection
      utils.enroll.list.setData(undefined, (old) =>
        old?.map((enroll) =>
          enroll.SectionId === updatedEnroll.SectionId
            ? { User: userId!, ...updatedEnroll.Data }
            : enroll
        )
      )
      setSwapSection(
        sections.data?.find(
          (secion) => secion.SectionId === updatedEnroll.Data.SectionId
        )
      )
      return { oldEnrolls, oldSection }
    },
    onError: (error, variables, context) => {
      utils.enroll.list.setData(undefined, context?.oldEnrolls)
      setSwapSection(context?.oldSection)
    },
    onSettled: (data, error, variables, context) => {
      utils.enroll.invalidate()
    },
  })

  const { Code, Name, Description, MinUnits, MaxUnits, Prereqs } = course
  const prereqs = Prereqs as unknown as Prereq[] | null

  let cardStyle = cn(showBorder ? "my-2" : "border-none shadow-none")

  return (
    <Card ref={ref} className={cardStyle} key={Code}>
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
          <CollapsibleTrigger className="flex flex-1 items-center justify-between py-1 font-medium transition-all hover:underline">
            Sections
            {!showSections ? <ChevronDown /> : <ChevronUp />}
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
                      onClick={() => {
                        updateMutation.mutate({
                          SectionId: swapSection.SectionId,
                          Data: {
                            SectionId,
                            Type: Enrolled_Type.ShoppingCart,
                            Seat: null,
                          },
                        })
                      }}
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
