import { useEffect, useState } from "react";
import { Enrolled_Type, Sections } from "@prisma/client"
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar"
import { trpc } from "@/lib/trpc";
import { CalendarEvent } from "@/interfaces/CalendarTypes";
import { SourceTextModule } from "vm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

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
        <div>
          <h1 className="font-bold ml-4 pb-2">{CURRENT_QUARTER}</h1>
          <div> 
            {[
              ["Enrolled", "bg-green-400", Enrolled_Type.Enrolled],
              ["Waitlisted", "bg-teal-500", Enrolled_Type.Waitlist],
              ["In Shopping Cart", "bg-yellow-300", Enrolled_Type.ShoppingCart],
            ].map((entry) => (
                <Toggle
                  key={entry[0]}
                  className={`flex-1 ${entry[1]} ${showingSections.includes(entry[2] as Enrolled_Type) ? 'bg-opacity-50' : 'bg-opacity-100'} border-2 px-4 border-slategrey-500 rounded-md`}
                  onPressedChange={() => updateShowingSections(entry[2] as Enrolled_Type)}
                  defaultPressed={entry[2] === Enrolled_Type.Enrolled ? false : true}
                >
                  {entry[0]}
                </Toggle>
            ))}
          </div>
        </div>
      
        <div>
          <WeekCalendar height={calendarHeight} width="" sections={sections ? sections : []}/>
        </div>
      </>
  );
}

