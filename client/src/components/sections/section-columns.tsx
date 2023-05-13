"use client"

import { Sections } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { DataTableSortableColumnHeader } from "../courses/data-table-sortable-column-header"
import { columns } from "../courses/columns"
import { AdminSectionsRowActions } from "./admin-sections-row-actions"

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

const temp = [...columns]
temp.push({
  id: "actions",
  cell: ({ row }) => <AdminSectionsRowActions row={row} />,
})
export const sectionColumns: ColumnDef<Sections>[] = temp;