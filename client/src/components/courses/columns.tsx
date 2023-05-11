"use client"

import { Sections } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"

function daysToString(section: Sections): string {
  const shortDay: { [key: string]: string } = {
    Sunday: "U",
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "R",
    Friday: "F",
    Saturday: "S",
  }
  return Object.keys(shortDay)
    .map(
      (day) =>
        day in section &&
        (section as unknown as { [key: string]: boolean | null | undefined })[
          day
        ] &&
        shortDay[day]
    )
    .filter((d) => d)
    .join("/")
}

export const columns: ColumnDef<Sections>[] = [
  {
    accessorKey: "Professor",
    header: "Professor",
  },
  {
    accessorFn: (section) => daysToString(section),
    header: "Days",
  },
]
