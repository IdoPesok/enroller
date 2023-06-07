"use client"

import { Row } from "@tanstack/react-table"
import { Eraser, MoreHorizontal, Pen, Trash, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { trpc } from "@/lib/trpc"
import { ButtonSpinner } from "../ui/button-spinner"
import { useToast } from "../ui/use-toast"
import { SectionWithCourse } from "@/interfaces/SectionTypes"
import { EnrolledWithUserData } from "@/interfaces/EnrolledTypes"

export interface EnrolledUsersRowActionHandlers {
  handleUnenroll: (row: Row<EnrolledWithUserData>) => void
}

interface DataTableRowActionsProps<TData>
  extends EnrolledUsersRowActionHandlers {
  row: Row<EnrolledWithUserData>
}

export function EnrolledUsersRowActions<TData>({
  row,
  handleUnenroll,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => handleUnenroll(row)}>
          <Eraser className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Unenroll
          <DropdownMenuShortcut>
            <>⌘⌫</>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
