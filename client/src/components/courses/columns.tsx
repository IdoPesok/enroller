"use client"

import { Sections } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

type SectionDays = { [key: string]: boolean | null | undefined }

function capitalize(string: string | null | undefined) {
  return string && string[0].toUpperCase() + string.slice(1)
}

function camelAddSpace(string: string | null | undefined) {
  return string?.replace(/([a-z])([A-Z])/g, "$1 $2")
}

const hmFormat = (date: Date) => format(date, "h:mm aaa")

function daysFormat({ Start, End, ...section }: Sections): string {
  const shortDay: { [key: string]: string } = {
    Sunday: "Su",
    Monday: "M",
    Tuesday: "Tu",
    Wednesday: "W",
    Thursday: "Th",
    Friday: "F",
    Saturday: "Sa",
  }
  return Object.keys(shortDay)
    .map(
      (day) =>
        day in section &&
        (section as unknown as SectionDays)[day] &&
        shortDay[day]
    )
    .filter((d) => d)
    .join("/")
}

export const columns: ColumnDef<Sections>[] = [
  {
    header: "Professor",
    accessorKey: "Professor",
  },
  {
    header: "Days",
    accessorFn: (section) => daysFormat(section),
  },
  {
    header: "Start",
    accessorKey: "Start",
    cell: ({ row }) => {
      const start = row.getValue<Date>("Start")
      return hmFormat(start)
    },
  },
  {
    header: "End",
    accessorKey: "End",
    cell: ({ row }) => {
      const End = row.getValue<Date>("End")
      return hmFormat(End)
    },
  },
  {
    header: "Enrolled",
    // TODO: get enrolled programatically
    accessorFn: ({ Capacity }) => `${0}/${Capacity}`,
  },
  {
    header: "Waitlist",
    accessorKey: "WaitlistCapacity",
  },
  {
    header: "Class Type",
    accessorFn: ({ Format }) => camelAddSpace(Format),
  },
  {
    header: "Modality",
    accessorFn: ({ Modality }) => camelAddSpace(Modality),
  },
]
