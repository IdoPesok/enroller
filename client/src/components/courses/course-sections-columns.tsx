"use client"

import { Enrolled, Sections } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableSortableColumnHeader } from "./data-table-sortable-column-header"
import { camelAddSpace, daysFormat, hmFormat } from "@/lib/section-formatting"
import { Trash2 } from "lucide-react"
import React from "react"

export function columns(
  enrollNode: (section: Sections) => React.ReactNode
): ColumnDef<Sections>[] {
  return [
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
        return value.includes(row.getValue(id))
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
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "cart",
      cell: ({ row }) => {
        const section = row.original
        return enrollNode(section)
      },
    },
  ]
}
