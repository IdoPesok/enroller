// start/end format: YYYY-MM-DDTHH:MM:SS 
export interface CalendarEvent {
    start: string,
    end: string, 
    title: string
}
  
  // red background behind conflicting events
export interface CalendarConflictEvent{
    start: string,
    end: string, 
    display: string, 
    color: string, 
}