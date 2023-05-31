import { Sections } from "@prisma/client"
import { format } from "date-fns"

type SectionDays = { [key: string]: boolean | null | undefined }

export function camelAddSpace(string?: string | null) {
  return string?.replace(/([a-z])([A-Z])/g, "$1 $2")
}

export const hmFormat = (date: Date) => format(date, "h:mm aaa")

export function daysFormat({ Start, End, ...section }: Sections): string {
  const letterDay: { [key: string]: string } = {
    Sunday: "S",
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "R",
    Friday: "F",
    Saturday: "U",
  }
  const shortDay: { [key: string]: string } = {
    Sunday: "Su",
    Monday: "Mo",
    Tuesday: "Tu",
    Wednesday: "We",
    Thursday: "Th",
    Friday: "Fr",
    Saturday: "Sa",
  }
  let days = Object.keys(letterDay).filter(
    (day) =>
      day in section &&
      (section as unknown as SectionDays)[day] &&
      letterDay[day]
  )
  days =
    days.length > 2
      ? days.map((day) => letterDay[day])
      : days.map((day) => shortDay[day])

  return days.join("/")
}
