"use client"

import { ColumnDef } from "@tanstack/react-table"
import { columns } from "../courses/columns"
import { AdminSectionRowActionHandlers, AdminSectionsRowActions } from "./admin-sections-row-actions"
import { SectionWithCourse } from "@/interfaces/SectionTypes"


export const getAdminSectionsColumns = (handlers: AdminSectionRowActionHandlers): ColumnDef<SectionWithCourse>[] => {
  const temp: ColumnDef<SectionWithCourse>[] = [...columns] as ColumnDef<SectionWithCourse>[]
  temp.push({
    id: "actions",
    cell: ({ row }) => (
      <AdminSectionsRowActions 
        row={row} 
        handleEdit={handlers.handleEdit}
        handleRefresh={handlers.handleRefresh}
      />
    ),
  })

  return temp;
}