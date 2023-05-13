"use client"

import { Row } from "@tanstack/react-table"
import { Copy, MoreHorizontal, Pen, Star, Tags, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "../ui/use-toast"
import { trpc } from "@/lib/trpc"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function AdminSectionsRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { toast } = useToast()

  const deleteMutation = trpc.section.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Section deleted!",
        description: "The section was successfully deleted.",
      })
    }
  })
  // const handleDelete = () => {
  //   deleteMutation.mutate({
  //     Code: row.original.
  //   })
  // }

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
        <DropdownMenuItem>
          <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}