import { prereqsString } from "@/lib/prereqs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Courses } from "@prisma/client"
import { Prereq } from "@/interfaces/PrereqTypes"
import { Button } from "../ui/button"
import Link from "next/link"

interface Props {
  course: Courses
  showLink?: boolean
}

export default function CourseCard({ course, showLink = true }: Props) {
  const { Code, Name, Description, MinUnits, MaxUnits, Prereqs } = course
  const prereqs = Prereqs as unknown as Prereq[] | null

  return (
    <Card className={"my-2"} key={Code}>
      <CardHeader>
        <CardTitle>
          {Name}
          <span className="text-right font-normal text-base float-right">
            {MinUnits == MaxUnits ? MinUnits : `${MinUnits}-${MaxUnits}`}{" "}
            units
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
        {
          showLink && (
            <div className="flex justify-end">
              <Button className="mt-5">
                <Link href={`/courses/${Code}`}>View Course</Link>
              </Button>
            </div>
          )
        }
      </CardContent>
    </Card>
  )
}