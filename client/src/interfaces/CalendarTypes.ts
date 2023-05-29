import Calendar from "@/pages/student/calendar"

// start/end format: YYYY-MM-DDTHH:MM:SS 
export interface CalendarEvent {
    start: string,
    end: string, 
    title: string,
    color: string
}
  
  // red background behind conflicting events
export interface CalendarConflictEvent extends CalendarEvent {
    display: string
}