"use client"

import { ColumnDef } from "@tanstack/react-table"
import { columns } from "../courses/columns"
import {
  AdminSectionRowActionHandlers,
  AdminSectionsRowActions,
} from "./admin-sections-row-actions"
import { SectionWithCourse } from "@/interfaces/SectionTypes"
import { DataTableSortableColumnHeader } from "../courses/data-table-sortable-column-header"

export const getAdminSectionsColumns = (
  handlers: AdminSectionRowActionHandlers
): ColumnDef<SectionWithCourse>[] => {
  const temp: ColumnDef<SectionWithCourse>[] = [
    {
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Course" />
      ),
      accessorKey: "Course",
    },
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => (
        <AdminSectionsRowActions
          row={row}
          handleEdit={handlers.handleEdit}
          handleRefresh={handlers.handleRefresh}
          handleShowStudents={handlers.handleShowStudents}
        />
      ),
    },
  ] as ColumnDef<SectionWithCourse>[]

  return temp
}
