"use client"

import { Sections } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { DataTableSortableColumnHeader } from "./data-table-sortable-column-header"

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
    header: ({ column }) => (
      <DataTableSortableColumnHeader column={column} title="Professor" />
    ),
    accessorKey: "Professor",
  },
  {
    header: "Days",
    accessorFn: (section) => daysFormat(section),
  },
  {
    header: ({ column }) => (
      <DataTableSortableColumnHeader column={column} title="Start" />
    ),
    accessorKey: "Start",
    cell: ({ row }) => {
      const start = row.getValue<Date>("Start")
      return hmFormat(start)
    },
  },
  {
    header: ({ column }) => (
      <DataTableSortableColumnHeader column={column} title="End" />
    ),
    accessorKey: "End",
    cell: ({ row }) => {
      const end = row.getValue<Date>("End")
      return hmFormat(end)
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
    accessorFn: ({ Format }) => Format,
    cell: ({ row }) => {
      const format = row.getValue<string>("Class Type")
      return camelAddSpace(format)
    },
    filterFn: (row, id, value) => {
      return value.has(row.getValue(id))
    },
  },
  {
    header: "Modality",
    accessorFn: ({ Modality }) => Modality,
    cell: ({ row }) => {
      const modality = row.getValue<string>("Modality")
      return camelAddSpace(modality)
    },
    filterFn: (row, id, value) => {
      return value.has(row.getValue(id))
    },
  },
]
