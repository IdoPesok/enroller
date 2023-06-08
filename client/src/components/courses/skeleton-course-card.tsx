import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { cn } from "@/lib/utils"

interface Props {
  className?: string
  descriptionRowCount?: number
}

const SkeletonCourseCard = ({ className, descriptionRowCount = 4 }: Props) => {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader>
        <CardTitle className="mb-5">
          <span className="rounded bg-slate-200 h-6 text-left w-24 font-normal float-left" />
          <span className="rounded bg-slate-200 h-6 text-right w-10 font-normal text-base float-right" />
        </CardTitle>
        <CardDescription>
          <span className="rounded bg-slate-200 h-6 text-left w-10 font-normal float-left" />
          <span className="rounded bg-slate-200 h-6 text-right w-16 font-normal text-base float-right" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {Array.from({ length: descriptionRowCount }).map((_, i) => (
          <p
            key={i}
            className={cn(
              "rounded bg-slate-200 h-6",
              i === descriptionRowCount - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </CardContent>
    </Card>
  )
}

export default SkeletonCourseCard
