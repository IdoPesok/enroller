import React, { useState } from "react"
import { prereqsString } from "@/lib/prereqs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

const SkeletonCourseCard = () => {
  return (
    <Card className="animate-pulse">
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
        <p className="rounded bg-slate-200 h-6" />
        <p className="rounded bg-slate-200 h-6" />
        <p className="rounded bg-slate-200 h-6" />
        <p className="rounded bg-slate-200 h-6 w-50" />
      </CardContent>
    </Card>
  )
}

export default SkeletonCourseCard
