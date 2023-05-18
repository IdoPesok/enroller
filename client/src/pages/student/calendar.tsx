import { useEffect, useState } from "react";
import { Courses } from "@prisma/client"
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@radix-ui/react-checkbox"

interface props {
  currentQuater: String,
  height: number,
  courses: Courses[]
}


const CURRENT_QUARTER = 'Spring 2023' // hard coded for now as placeholder
const calendarHeight = 600 // TODO: find best way of sizing height 

export default function Calendar(props:props){
  return (
      <>
        <div className="columns-2 text-center gap-x-2 pb-4">
          <div>
            <label>
              Show Enrolled Classes
              <input type="checkbox" className="ml-2"/>
            </label>
          </div>

          <div>
            <label>
              Show Waitlisted Classes
              <input type="checkbox" className="ml-2"/>
            </label>
          </div>
        </div>

        <WeekCalendar currentQuarter={CURRENT_QUARTER} height={calendarHeight} width="" courses={[]}></WeekCalendar>
      </>

  );
}
