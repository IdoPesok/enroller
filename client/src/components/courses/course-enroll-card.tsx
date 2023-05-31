import React, { useState } from "react"
import { prereqsString } from "@/lib/prereqs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Courses, Enrolled, Enrolled_Type } from "@prisma/client"
import { Prereq } from "@/interfaces/PrereqTypes"
import { Button } from "../ui/button"
import Link from "next/link"
import { generateStudentRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { trpc } from "@/lib/trpc"
import { ChevronDown, ChevronUp, ShoppingCart, Trash2 } from "lucide-react"
import { Spinner } from "../ui/spinner"
import CourseSections from "./course-sections"
import { useAuth } from "@clerk/nextjs"
import { useToast } from "../ui/use-toast"
import { hmFormat } from "@/lib/section-formatting"

interface Props {
  course: Courses
  showBorder?: boolean
}

const CourseEnrollCard = React.forwardRef<
  React.ComponentRef<typeof Card>,
  React.ComponentPropsWithoutRef<typeof Card> & Props
>(({ course, showBorder = true }, ref) => {
  const { userId } = useAuth()
  const utils = trpc.useContext()
  const toast = useToast()

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

  const enrollMutation = trpc.enroll.create.useMutation({
    onMutate: async (newEnroll) => {
      await utils.enroll.list.cancel()
      const oldEnrolls = utils.enroll.list.getData()
      utils.enroll.list.setData(
        undefined,
        (old) => old && [...old, { User: userId!, ...newEnroll }]
      )
      return { oldEnrolls }
    },
    onError: (error, variables, context) => {
      utils.enroll.list.setData(undefined, context?.oldEnrolls)
    },
    onSettled: (data, error, variables, context) => {
      utils.enroll.list.invalidate()
      const section = sections.data?.find(
        (section) => section.SectionId === data?.SectionId
      )!
      toast.toast({
        title: `Added ${section.Course}`,
        description: `Added ${section.Course} with ${
          section?.Professor
        } at ${hmFormat(section.Start)} to shopping cart`,
      })
    },
  })
  const deleteMutation = trpc.enroll.delete.useMutation({
    onMutate: async ({ SectionId: deletedId }) => {
      await utils.enroll.list.cancel()
      const oldEnrolls = utils.enroll.list.getData()
      utils.enroll.list.setData(
        undefined,
        (old) => old && old.filter((enroll) => enroll.SectionId !== deletedId)
      )
      return { oldEnrolls }
    },
    onError: (error, variables, context) => {
      utils.enroll.list.setData(undefined, context?.oldEnrolls)
    },
    onSettled: (data, error, variables, context) => {
      utils.enroll.list.invalidate()
      const section = sections.data?.find(
        (section) => section.SectionId === data?.SectionId
      )!
      toast.toast({
        title: `Removed ${section.Course}`,
        description: `Removed ${section.Course} with ${
          section?.Professor
        } at ${hmFormat(section.Start)} from shopping cart`,
      })
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
          <CollapsibleTrigger className="flex flex-1 items-center justify-between py-1 transition-all hover:underline mt-3 font-bold text-md">
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
                  ) ? (
                    <Button
                      onClick={() => {
                        enrollMutation.mutate({
                          SectionId,
                          Type: Enrolled_Type.ShoppingCart,
                          Seat: null,
                        })
                      }}
                    >
                      <ShoppingCart size={16} />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        deleteMutation.mutate({ SectionId })
                      }}
                    >
                      <Trash2 size={16} />
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
CourseEnrollCard.displayName = "CourseEnrollCard"

export default CourseEnrollCard
