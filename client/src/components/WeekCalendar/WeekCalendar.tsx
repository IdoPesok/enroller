
import { Sections } from "@prisma/client"
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'


interface props {
    currentQuarter: string,
    height: number,
    width: string,
    courses?: Sections[]
}

// currently hard coded to show the same exact week since events need 
// dates in order to be placed on the calendar
// might be a better way of doing this but this is the best I have found so far
const MONDAY_DATE = "2023-05-07"
const TUESDAY_DATE = "2023-05-08"
const WEDNESDAY_DATE = "2023-05-09"
const THURSDAY_DATE = "2023-05-10"
const FRIDAY_DATE = "2023-05-11"

// start/end format: YYYY-MM-DDTHH:MM:SS 
interface Event {
  start: string,
  end: string, 
  title: string
}

// red background behind conflicting events
interface ConflictEvent{
  start: string,
  end: string, 
  display: string, 
  color: string, 
}


export default function WeekCalendar(props: props){
    const { currentQuarter, height, width} = props
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

            events={[]}
            eventBackgroundColor="rgb(16 185 129)"
            slotEventOverlap={false}
            />
          </div>
      </>
    );
}
