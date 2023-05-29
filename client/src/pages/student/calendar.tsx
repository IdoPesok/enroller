import { useEffect, useState } from "react";
import { Enrolled_Type, Sections } from "@prisma/client"
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar"
import { trpc } from "@/lib/trpc";
import { CalendarEvent } from "@/interfaces/CalendarTypes";
import { SourceTextModule } from "vm";

interface props {
  currentQuarter: string,
  height: number,
  width: string,
}


const CURRENT_QUARTER = 'Spring 2023' // hard coded for now as placeholder
const calendarHeight = 600 // TODO: find best way of sizing height 

export default function Calendar(props:props){
  const [showingSections, setShowingSections] = useState<Enrolled_Type[]>([Enrolled_Type.Enrolled])

  const sections = trpc.home.userSections.useQuery({ types: showingSections }).data 
  console.log("sections: " + sections)

  const updateShowingSections = (type : Enrolled_Type) => {
    if (showingSections.includes(type)) {
      setShowingSections(showingSections.filter((t) => t !== type))
    } else {  
      setShowingSections([...showingSections, type])
    }
    return
  }

  return (
      <>
        <div className="columns-3 text-center gap-x-2 pb-4">
          <div>
            <label>
              Show Enrolled Classes
              <input type="checkbox" className="ml-2" defaultChecked={true} onChange={() => updateShowingSections(Enrolled_Type.Enrolled)}/>
            </label>
          </div>
          <div>
            <label>
              Show Waitlisted Classes
              <input type="checkbox" className="ml-2" onChange={() => updateShowingSections(Enrolled_Type.Waitlist)}/>
            </label>
          </div>
          <div>
            <label>
              Show Shopping Cart Classes
              <input type="checkbox" className="ml-2" onChange={() => updateShowingSections(Enrolled_Type.ShoppingCart)}/>
            </label>
          </div>
        </div>

        <div>
          <WeekCalendar currentQuarter={CURRENT_QUARTER} height={calendarHeight} width="" sections={sections ? sections : []}/>
        </div>
      </>
  );
}

