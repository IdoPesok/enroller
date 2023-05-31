import React, { MouseEvent, ReactNode, useRef } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import CourseExpandedRow from "@/components/courses/course-expanded-row"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface Props {
  children: ReactNode
  code: string
}

export default function CourseRow({ children, code }: Props) {
  const [expanded, setExpanded] = useState(false)

  const handleRowClick = () => {
    setExpanded(!expanded)
  }

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer bg-white hover:bg-white",
          expanded && "border-b-0"
        )}
        onClick={handleRowClick}
      >
        {children}
      </TableRow>
      {expanded && (
        <CourseExpandedRow
          courseCode={code}
          onClick={() => setExpanded(false)}
        />
      )}
    </>
  )
}
