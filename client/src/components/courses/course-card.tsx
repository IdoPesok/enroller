import React, { useState } from "react"
import { prereqsString } from "@/lib/prereqs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Courses } from "@prisma/client"
import { Prereq } from "@/interfaces/PrereqTypes"

interface Props {
  course: Courses
  linkButton?: React.ReactNode
}

const CourseCard = React.forwardRef<
  React.ComponentRef<typeof Card>,
  React.ComponentPropsWithoutRef<typeof Card> & Props
>(({ course, linkButton, ...props }, ref) => {
  const { Code, Name, Description, MinUnits, MaxUnits, Prereqs } = course
  const prereqs = Prereqs as unknown as Prereq[] | null

  // let cardStyle = "my-2" : "border-none shadow-none")

  return (
    <Card ref={ref} key={Code} {...props}>
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
      </CardContent>
      <CardFooter className="justify-end flex">{linkButton}</CardFooter>
    </Card>
  )
})
CourseCard.displayName = "CourseCard"

export default CourseCard
