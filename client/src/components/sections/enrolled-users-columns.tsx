"use client"

import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableSortableColumnHeader } from "../courses/data-table-sortable-column-header"
import { EnrolledWithUserData } from "@/interfaces/EnrolledTypes"
import {
  EnrolledUsersRowActionHandlers,
  EnrolledUsersRowActions,
} from "./enrolled-users-row-actions"
import EnrolledTypeBubble from "./enrolled-type-bubble"

export const getEnrolledUsersColumns = (
  handlers: EnrolledUsersRowActionHandlers
): ColumnDef<EnrolledWithUserData>[] => {
  return [
    {
      id: "picture",
      cell: ({ row }) => (
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={row.original.userData.profileImageUrl}
            alt="@shadcn"
          />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
      ),
    },
    {
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="First Name" />
      ),
      accessorKey: "userData.firstName",
    },
    {
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Last Name" />
      ),
      accessorKey: "userData.lastName",
    },
    {
      id: "email",
      header: () => <span>Email</span>,
      cell: ({ row }) => {
        const found = row.original.userData.emailAddresses.find(
          (email) => email.id === row.original.userData.primaryEmailAddressId
        )
        return <span>{found?.emailAddress}</span>
      },
    },
    {
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Flowchart" />
      ),
      accessorKey: "userData.publicMetadata.flowchartId",
    },
    {
      id: "type",
      header: () => <span>Type</span>,
      cell: ({ row }) => <EnrolledTypeBubble Status={row.original.Type} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <EnrolledUsersRowActions
          row={row}
          handleUnenroll={handlers.handleUnenroll}
        />
      ),
    },
  ] as ColumnDef<EnrolledWithUserData>[]
}
