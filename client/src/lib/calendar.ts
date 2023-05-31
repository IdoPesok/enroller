// currently hard coded to show the same exact week since events need
// dates in order to be placed on the calendar

import {
  CalendarConflictEvent,
  CalendarEvent,
} from "@/interfaces/CalendarTypes"
import { EnrolledWithSection } from "@/interfaces/EnrolledTypes"
import { Enrolled_Type, Sections } from "@prisma/client"

// might be a better way of doing this but this is the best I have found so far
const MONDAY_DATE = "2023-05-07"
const TUESDAY_DATE = "2023-05-08"
const WEDNESDAY_DATE = "2023-05-09"
const THURSDAY_DATE = "2023-05-10"
const FRIDAY_DATE = "2023-05-11"

const defaultClass = "px-1 "
const EVENT_CLASSNAMES_MAP: Record<Enrolled_Type, string> = {
  Enrolled:
    defaultClass +
    "bg-green-200 hover:bg-green-300 hover:text-green-800 text-green-800 !border !border-green-500",
  Waitlist:
    defaultClass +
    "bg-amber-200 hover:bg-amber-300 hover:text-amber-800 text-amber-800 !border !border-amber-500",
  ShoppingCart:
    defaultClass +
    "bg-sky-200 hover:bg-sky-300 hover:text-sky-800 text-sky-800 !border !border-sky-500",
}

const DateValueArr = [
  ["Monday", MONDAY_DATE],
  ["Tuesday", TUESDAY_DATE],
  ["Wednesday", WEDNESDAY_DATE],
  ["Thursday", THURSDAY_DATE],
  ["Friday", FRIDAY_DATE],
] as [keyof Sections, string][]

const transformTime = (time: Date) => {
  let hours = time.getHours().toString()
  let minutes = time.getMinutes().toString()
  if (time.getHours() < 10) {
    hours = "0" + hours
  }
  if (time.getMinutes() < 10) {
    minutes = "0" + minutes
  }
  return "T" + hours + ":" + minutes + ":00"
}

const createConflictEvent = (
  v: (typeof DateValueArr)[number],
  start: Date,
  end: Date
) => {
  return {
    start: v[1] + transformTime(start),
    end: v[1] + transformTime(end),
    classNames:
      "!bg-white !opacity-100 rounded !left-[-4px] border-red-500 border-4",
    display: "background",
    title: "",
  }
}

const checkAndPushConflict = (
  sectionOneStart: Date,
  sectionOneEnd: Date,
  sectionTwoStart: Date,
  sectionTwoEnd: Date,
  v: (typeof DateValueArr)[number],
  conflictEvents: CalendarConflictEvent[]
) => {
  if (sectionOneStart < sectionTwoEnd && sectionOneEnd > sectionTwoStart) {
    conflictEvents.push(createConflictEvent(v, sectionOneStart, sectionOneEnd))
  } else if (
    (sectionOneStart > sectionTwoStart && sectionOneStart < sectionTwoEnd) ||
    (sectionOneStart < sectionTwoStart && sectionOneEnd > sectionTwoEnd)
  ) {
    conflictEvents.push(createConflictEvent(v, sectionTwoStart, sectionOneEnd))
  } else if (
    sectionTwoStart < sectionOneStart &&
    sectionTwoEnd > sectionTwoEnd
  ) {
    conflictEvents.push(createConflictEvent(v, sectionTwoStart, sectionTwoEnd))
  }
}

export const createConflictEvents = (sections: EnrolledWithSection[]) => {
  const conflictEvents: CalendarConflictEvent[] = []

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      let sectionOne = sections[i].Section
      let sectionTwo = sections[j].Section

      let sectionOneStart = new Date(sectionOne.Start)
      sectionOneStart.setMinutes(sectionOneStart.getMinutes() - 10)

      let sectionOneEnd = new Date(sectionOne.End)
      sectionOneEnd.setMinutes(sectionOneEnd.getMinutes() + 10)

      let sectionTwoStart = new Date(sectionTwo.Start)
      sectionTwoStart.setMinutes(sectionTwoStart.getMinutes() - 10)

      let sectionTwoEnd = new Date(sectionTwo.End)
      sectionTwoEnd.setMinutes(sectionTwoEnd.getMinutes() + 10)

      for (const v of DateValueArr) {
        if (sectionOne[v[0]] && sectionTwo[v[0]]) {
          checkAndPushConflict(
            sectionOneStart,
            sectionOneEnd,
            sectionTwoStart,
            sectionTwoEnd,
            v,
            conflictEvents
          )
        }
      }
    }
  }
  return conflictEvents
}

export const createEvents = (
  sections: EnrolledWithSection[]
): CalendarEvent[] => {
  return sections.flatMap((entry) => {
    const newEvents = []
    const section = entry.Section
    const sectionType = entry.Type

    for (const v of DateValueArr) {
      if (section[v[0]]) {
        newEvents.push({
          title: section.Course + "-" + section.SectionId,
          start: v[1] + transformTime(section.Start),
          end: v[1] + transformTime(section.End),
          classNames: EVENT_CLASSNAMES_MAP[sectionType],
        })
      }
    }

    return newEvents
  })
}
