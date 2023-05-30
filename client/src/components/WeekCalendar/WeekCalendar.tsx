
import { Enrolled_Type, Sections } from "@prisma/client"
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { CalendarEvent, CalendarConflictEvent } from "@/interfaces/CalendarTypes"
import ja from "date-fns/esm/locale/ja/index.js"


interface props {
    height: number,
    width: string,
    sections: (Enrolled_Type | Sections)[][]
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


export default function WeekCalendar(props: props){
  const { height, width, sections } = props
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

  const createConflictEvents = (sections:  (Enrolled_Type | Sections)[][]) => {
    const conflictEvents: CalendarConflictEvent[] = []
    let i = 0 
    while(i < sections.length){
      let j = i + 1
      let sectionOne = sections[i][0] as Sections

      while(j < sections.length){
        let sectionTwo = sections[j][0] as Sections
        const sectionOneStart = new Date(sectionOne.Start)
        sectionOneStart.setMinutes(sectionOneStart.getMinutes() - 10)
        const sectionOneEnd = new Date(sectionOne.End)
        sectionOneEnd.setMinutes(sectionOneEnd.getMinutes() + 10)
        const sectionTwoStart = new Date(sectionTwo.Start)
        sectionTwoStart.setMinutes(sectionTwoStart.getMinutes() - 10)
        const sectionTwoEnd = new Date(sectionTwo.End)
        sectionTwoEnd.setMinutes(sectionTwoEnd.getMinutes() + 10)

        if(sectionOne.Monday && sectionTwo.Monday){
          if(sectionOneStart < sectionTwoEnd && sectionOneEnd > sectionTwoStart){
            conflictEvents.push({ start: MONDAY_DATE + transformTime(sectionOneStart), end: MONDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: MONDAY_DATE + transformTime(sectionTwoStart), end: MONDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: MONDAY_DATE + transformTime(sectionTwoStart), end: MONDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart < sectionTwoStart && sectionOneEnd > sectionTwoEnd){
            conflictEvents.push({ start: MONDAY_DATE + transformTime(sectionOneStart), end: MONDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionTwoStart < sectionOneStart && sectionTwoEnd > sectionTwoEnd){
            conflictEvents.push({ start: MONDAY_DATE + transformTime(sectionTwoStart), end: MONDAY_DATE + transformTime(sectionTwoEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
        }
        if(sectionOne.Tuesday && sectionTwo.Tuesday){
          if(sectionOneStart < sectionTwoEnd && sectionOneEnd > sectionTwoStart){
            conflictEvents.push({ start: TUESDAY_DATE + transformTime(sectionOneStart), end: TUESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: TUESDAY_DATE + transformTime(sectionTwoStart), end: TUESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: TUESDAY_DATE + transformTime(sectionTwoStart), end: TUESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart < sectionTwoStart && sectionOneEnd > sectionTwoEnd){
            conflictEvents.push({ start: TUESDAY_DATE + transformTime(sectionOneStart), end: TUESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionTwoStart < sectionOneStart && sectionTwoEnd > sectionTwoEnd){
            conflictEvents.push({ start: TUESDAY_DATE + transformTime(sectionTwoStart), end: TUESDAY_DATE + transformTime(sectionTwoEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
        }
        if(sectionOne.Wednesday && sectionTwo.Wednesday){
          if(sectionOneStart < sectionTwoEnd && sectionOneEnd > sectionTwoStart){
            conflictEvents.push({ start: WEDNESDAY_DATE + transformTime(sectionOneStart), end: WEDNESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: WEDNESDAY_DATE + transformTime(sectionTwoStart), end: WEDNESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: WEDNESDAY_DATE + transformTime(sectionTwoStart), end: WEDNESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart < sectionTwoStart && sectionOneEnd > sectionTwoEnd){
            conflictEvents.push({ start: WEDNESDAY_DATE + transformTime(sectionOneStart), end: WEDNESDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionTwoStart < sectionOneStart && sectionTwoEnd > sectionTwoEnd){
            conflictEvents.push({ start: WEDNESDAY_DATE + transformTime(sectionTwoStart), end: WEDNESDAY_DATE + transformTime(sectionTwoEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
        }
        if(sectionOne.Thursday && sectionTwo.Thursday){
          if(sectionOneStart < sectionTwoEnd && sectionOneEnd > sectionTwoStart){
            conflictEvents.push({ start: THURSDAY_DATE + transformTime(sectionOneStart), end: THURSDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: THURSDAY_DATE + transformTime(sectionTwoStart), end: THURSDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: THURSDAY_DATE + transformTime(sectionTwoStart), end: THURSDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart < sectionTwoStart && sectionOneEnd > sectionTwoEnd){
            conflictEvents.push({ start: THURSDAY_DATE + transformTime(sectionOneStart), end: THURSDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionTwoStart < sectionOneStart && sectionTwoEnd > sectionTwoEnd){
            conflictEvents.push({ start: THURSDAY_DATE + transformTime(sectionTwoStart), end: THURSDAY_DATE + transformTime(sectionTwoEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
        }
        if(sectionOne.Friday && sectionTwo.Friday){
          if(sectionOneStart < sectionTwoEnd && sectionOneEnd > sectionTwoStart){
            conflictEvents.push({ start: FRIDAY_DATE + transformTime(sectionOneStart), end: FRIDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: FRIDAY_DATE + transformTime(sectionTwoStart), end: FRIDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd){
            conflictEvents.push({ start: FRIDAY_DATE + transformTime(sectionTwoStart), end: FRIDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionOneStart < sectionTwoStart && sectionOneEnd > sectionTwoEnd){
            conflictEvents.push({ start: FRIDAY_DATE + transformTime(sectionOneStart), end: FRIDAY_DATE + transformTime(sectionOneEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
          else if (sectionTwoStart < sectionOneStart && sectionTwoEnd > sectionTwoEnd){
            conflictEvents.push({ start: FRIDAY_DATE + transformTime(sectionTwoStart), end: FRIDAY_DATE + transformTime(sectionTwoEnd), color: "#b91c1c", display: "background", title: "TIME CONFLICT" })
          }
        }
        j++
      }
      i++
    }
    return conflictEvents
  }

  const createEvents = (type: Enrolled_Type, sections: (Enrolled_Type | Sections)[][]) => {
    const events: CalendarEvent[] = sections.flatMap((entry) => {
      const newEvents = []
      const section = entry[0] as Sections
      const sectionType = entry[1] as Enrolled_Type
      if(sectionType === type){
        if(section.Monday){
          newEvents.push({
            title: section.Course + "-" + section.SectionId,
            start: MONDAY_DATE + transformTime(section.Start),
            end: MONDAY_DATE + transformTime(section.End),
            color: EVENT_COLOR_MAP.get(type)!
          })
        }
        if(section.Tuesday){
          newEvents.push({
            title: section.Course + "-" + section.SectionId,
            start: TUESDAY_DATE + transformTime(section.Start),
            end: TUESDAY_DATE + transformTime(section.End),
            color: EVENT_COLOR_MAP.get(type)!
          })
        }
        if(section.Wednesday){
          newEvents.push({
            title: section.Course + "-" + section.SectionId,
            start: WEDNESDAY_DATE + transformTime(section.Start),
            end: WEDNESDAY_DATE + transformTime(section.End),
            color: EVENT_COLOR_MAP.get(type)!
          })
        }
        if(section.Thursday){
          newEvents.push({
            title: section.Course + "-" + section.SectionId,
            start: THURSDAY_DATE + transformTime(section.Start),
            end: THURSDAY_DATE + transformTime(section.End),
            color: EVENT_COLOR_MAP.get(type)!
          })
        }
        if(section.Friday){
          newEvents.push({
            title: section.Course + "-" + section.SectionId,
            start: FRIDAY_DATE + transformTime(section.Start),
            end: FRIDAY_DATE + transformTime(section.End),
            color: EVENT_COLOR_MAP.get(type)!
          })
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
