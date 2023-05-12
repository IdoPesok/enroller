"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { classTypes, modalities } from "./options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getPreFilteredRowModel().rows.length >
    table.getFilteredRowModel().rows.length

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter professors..."
          value={
            (table.getColumn("Professor")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("Professor")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[200px] lg:w-[350px]"
        />
        <DataTableFacetedFilter
          column={table.getColumn("Class Type")}
          title={"Class\xa0Type"}
          options={classTypes}
        />
        <DataTableFacetedFilter
          column={table.getColumn("Modality")}
          title="Modality"
          options={modalities}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
