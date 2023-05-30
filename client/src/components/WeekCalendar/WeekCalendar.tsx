
import { Enrolled, Enrolled_Type, Sections } from "@prisma/client"
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { CalendarEvent, CalendarConflictEvent } from "@/interfaces/CalendarTypes"
import { EnrolledWithSection } from "@/interfaces/EnrolledTypes"

interface Props {
  height: number,
  width?: string,
  sections: EnrolledWithSection[]
}

// currently hard coded to show the same exact week since events need 
// dates in order to be placed on the calendar
// might be a better way of doing this but this is the best I have found so far
const MONDAY_DATE = "2023-05-07"
const TUESDAY_DATE = "2023-05-08"
const WEDNESDAY_DATE = "2023-05-09"
const THURSDAY_DATE = "2023-05-10"
const FRIDAY_DATE = "2023-05-11"

const ENROLLED_COLOR = "rgb(74 222 128)"
const WAITLIST_COLOR = "rgb(20 184 166)"
const SHOPPING_CART_COLOR = "rgb(253 224 71)"

const EVENT_COLOR_MAP: Map<Enrolled_Type, string> = new Map()
EVENT_COLOR_MAP.set(Enrolled_Type.Enrolled, ENROLLED_COLOR)
EVENT_COLOR_MAP.set(Enrolled_Type.Waitlist, WAITLIST_COLOR)
EVENT_COLOR_MAP.set(Enrolled_Type.ShoppingCart, SHOPPING_CART_COLOR)

const DateValueArr = [
  ["Monday", MONDAY_DATE],
  ["Tuesday", TUESDAY_DATE],
  ["Wednesday", WEDNESDAY_DATE],
  ["Thursday", THURSDAY_DATE],
  ["Friday", FRIDAY_DATE]
] as [keyof Sections, string][]

export default function WeekCalendar({
  height,
  width,
  sections
}: Props){
  let events: CalendarEvent[] = []

  const transformTime = (time: Date) => {
    let hours = time.getHours().toString()
    let minutes = time.getMinutes().toString()
    if (time.getHours() < 10) {
      hours = '0' + hours
    }
    if(time.getMinutes() < 10) {
      minutes = '0' + minutes
    }
    return "T" + hours + ":" + minutes + ":00"
  }

  const createConflictEvents = (sections: EnrolledWithSection[]) => {
    const conflictEvents: CalendarConflictEvent[] = []
    let i = 0 
    while(i < sections.length){
      let j = i + 1
      let sectionOne = sections[i].Section

      while(j < sections.length){
        let sectionTwo = sections[j].Section
        const sectionOneStart = new Date(sectionOne.Start)
        sectionOneStart.setMinutes(sectionOneStart.getMinutes() - 10)
        const sectionOneEnd = new Date(sectionOne.End)
        sectionOneEnd.setMinutes(sectionOneEnd.getMinutes() + 10)
        const sectionTwoStart = new Date(sectionTwo.Start)
        sectionTwoStart.setMinutes(sectionTwoStart.getMinutes() - 10)
        const sectionTwoEnd = new Date(sectionTwo.End)
        sectionTwoEnd.setMinutes(sectionTwoEnd.getMinutes() + 10)
        
        for (const v of DateValueArr) {
          if (sectionOne[v[0]] && sectionTwo[v[0]]) {
            if (sectionOneStart < sectionTwoEnd && sectionOneEnd > sectionTwoStart) {
              conflictEvents.push({ start: v[1] + transformTime(sectionOneStart), end: v[1] + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
            } else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
              conflictEvents.push({ start: v[1] + transformTime(sectionTwoStart), end: v[1] + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
            } else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
              conflictEvents.push({ start: v[1] + transformTime(sectionTwoStart), end: v[1] + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
            } else if (sectionOneStart < sectionTwoStart && sectionOneEnd > sectionTwoEnd){
              conflictEvents.push({ start: v[1] + transformTime(sectionOneStart), end: v[1] + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
            } else if (sectionTwoStart < sectionOneStart && sectionTwoEnd > sectionTwoEnd){
              conflictEvents.push({ start: v[1] + transformTime(sectionTwoStart), end: v[1] + transformTime(sectionTwoEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
            }
          }
        }

        j++
      }
      i++
    }
    return conflictEvents
  }

  const createEvents = (type: Enrolled_Type, sections: EnrolledWithSection[]) => {
    const events: CalendarEvent[] = sections.flatMap((entry) => {
      const newEvents = []
      const section = entry.Section
      const sectionType = entry.Type

      if(sectionType === type) {
        for (const v of DateValueArr) {
          if (section[v[0]]) {
            newEvents.push({
              title: section.Course + "-" + section.SectionId,
              start: DateValueArr[1] + transformTime(section.Start),
              end: DateValueArr[1] + transformTime(section.End),
              color: EVENT_COLOR_MAP.get(type)!
            })
          }
        }
      }
      return newEvents
    })
    return events
  }

  const conflicts = createConflictEvents(sections) 
  events = [...createEvents(Enrolled_Type.Enrolled, sections), ...createEvents(Enrolled_Type.Waitlist, sections), ...createEvents(Enrolled_Type.ShoppingCart, sections), ...conflicts as CalendarEvent[]]
    
  return (
    <>
      <div className={width}>
        <FullCalendar 
          plugins={[timeGridPlugin]}
          initialView='timeGridFiveDay'
          views={{ 
            timeGridFiveDay: {
              type: 'timeGrid',
              duration: { days: 5 },
            }  
          }}
          allDaySlot = {false}
          headerToolbar= {{
            left: "",
            center: "",
            right: "",
          }}
          slotMinTime={"06:00:00"}
          slotMaxTime={"22:00:00"}
          firstDay={1}
          contentHeight={height} // 1150 for current calanderPage
          initialDate="2023-05-07"
          
          expandRows={true}
          dayHeaderContent={(day) => {
            const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            return DAYS[day.date.getDay()];
          }}

          events={events}
          eventBackgroundColor="rgb(16 185 129)"
          slotEventOverlap={true}
        />
      </div>
    </>
  )
}
