
import { Sections } from "@prisma/client"
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { CalendarEvent } from "@/interfaces/CalendarTypes"


interface props {
    currentQuarter: string,
    height: number,
    width: string,
    sections: Sections[]
}

// currently hard coded to show the same exact week since events need 
// dates in order to be placed on the calendar
// might be a better way of doing this but this is the best I have found so far
const MONDAY_DATE = "2023-05-07"
const TUESDAY_DATE = "2023-05-08"
const WEDNESDAY_DATE = "2023-05-09"
const THURSDAY_DATE = "2023-05-10"
const FRIDAY_DATE = "2023-05-11"


export default function WeekCalendar(props: props){
  const { currentQuarter, height, width, sections } = props
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

  for(const section of sections){
    console.log("title: " + section.Course + "start: " + section.Start + "end: " + section.End)
  }
  events = sections.flatMap((section) => {
    if(section.Monday){
      events.push({
        title: section.Course,
        start: MONDAY_DATE + transformTime(section.Start),
        end: MONDAY_DATE + transformTime(section.End),
      })
    }
    if(section.Tuesday){
      events.push({
        title: section.Course,
        start: TUESDAY_DATE + transformTime(section.Start),
        end: TUESDAY_DATE + transformTime(section.End),
      })
    }
    if(section.Wednesday){
      events.push({
        title: section.Course,
        start: WEDNESDAY_DATE + transformTime(section.Start),
        end: WEDNESDAY_DATE + transformTime(section.End),
      })
    }
    if(section.Thursday){
      events.push({
        title: section.Course,
        start: THURSDAY_DATE + transformTime(section.Start),
        end: THURSDAY_DATE + transformTime(section.End),
      })
    }
    if(section.Friday){
      events.push({
        title: section.Course,
        start: FRIDAY_DATE + transformTime(section.Start),
        end: FRIDAY_DATE + transformTime(section.End),
      })
    }
    return events
  })
    
  return (
    <>
      <h1 className="font-bold">{currentQuarter}</h1>

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
          slotEventOverlap={false}
        />
      </div>
    </>
  )
}
