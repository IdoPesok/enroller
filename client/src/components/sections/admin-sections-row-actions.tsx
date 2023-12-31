"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pen, Trash, User } from "lucide-react"

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
import { SectionsWithCourseAndCounts } from "@/interfaces/SectionTypes"

export interface AdminSectionRowActionHandlers {
  handleRefresh: () => void
  handleEdit: (row: Row<SectionsWithCourseAndCounts>) => void
  handleShowStudents: (row: Row<SectionsWithCourseAndCounts>) => void
}

interface DataTableRowActionsProps<TData>
  extends AdminSectionRowActionHandlers {
  row: Row<SectionsWithCourseAndCounts>
}

export function AdminSectionsRowActions<TData>({
  row,
  handleRefresh,
  handleEdit,
  handleShowStudents,
}: DataTableRowActionsProps<TData>) {
  const { toast } = useToast()

  const deleteMutation = trpc.sections.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Section deleted!",
        description: "The section was successfully deleted.",
        variant: "success",
      })
      handleRefresh()
    },
    onError: (error) => {
      toast({
        title: "Error deleting section",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    if (deleteMutation.isLoading) return

    deleteMutation.mutate({
      SectionId: row.original.SectionId,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          {deleteMutation.isLoading ? (
            <ButtonSpinner />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => handleEdit(row)}>
          <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShowStudents(row)}>
          <User className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Students
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>
          <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Delete
          <DropdownMenuShortcut>
            {!deleteMutation.isLoading ? <>⌘⌫</> : <ButtonSpinner />}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
