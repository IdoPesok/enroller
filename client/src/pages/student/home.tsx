import { useEffect, useState } from "react"

import CourseRow from "@/components/courses/course-row"
import { Button } from "@/components/ui/button"

import SwapSheet from "@/components/courses/swap-sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { camelAddSpace, daysFormat, hmFormat } from "@/lib/section-formatting"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"
import { Enrolled_Type, Sections } from "@prisma/client"
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  MoreHorizontal,
  ShoppingCart,
} from "lucide-react"
import WeekCalendar from "@/components/WeekCalendar/WeekCalendar"

const CURRENT_QUARTER = 'Spring 2023' // hard coded for now as placeholder
const HEIGHT_OFFSET = 210 

export default function Home() {
  const [showingSections, setShowingSections] = useState<Enrolled_Type[]>([Enrolled_Type.Enrolled])
  const [calendarHeight, setCalendarHeight] = useState<number>(window.innerHeight - HEIGHT_OFFSET)

  // watch for resize events and update calendar height
  useEffect(() => {
    const handleResize = () => {
      setCalendarHeight(window.innerHeight - HEIGHT_OFFSET)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const utils = trpc.useContext()

  const deleteMutation = trpc.enroll.delete.useMutation({
    onSuccess: (data, variables, context) => {
      utils.enroll.listWithSectionCourses.invalidate()
    },
  })

  const [openDrop, setOpenDrop] = useState(false)
  const [swappingSection, setSwappingSection] = useState<
    Sections | null | undefined
  >(null)
  const [quarter, setQuarter] = useState("Spring 2023")
  const [showList, setShowList] = useState(true)
  const [modifyCourse, setModifyCourse] = useState("")

  const handleDropClick = (courseCode: string) => {
    setModifyCourse(courseCode)
    setOpenDrop(true)
  }

  const handleDropConfirm = (sectionId: number) => {
    deleteMutation.mutate({ SectionId: sectionId })
  }

  const handleQuarterChange = (value: string) => {
    setQuarter(value)
  }

  const sections = trpc.home.userSections.useQuery({ types: showingSections })

  const updateShowingSections = (type : Enrolled_Type) => {
    if (showingSections.includes(type)) {
      setShowingSections(showingSections.filter((t) => t !== type))
    } else {  
      setShowingSections([...showingSections, type])
    }
    return
  }

  const toggleButtons: [string, Enrolled_Type][] = [
    ["Enrolled", Enrolled_Type.Enrolled],
    ["Waitlisted", Enrolled_Type.Waitlist],
    ["In Shopping Cart", Enrolled_Type.ShoppingCart],
  ]

  const homeTable = (
    <div className="rounded-md border-2 mt-8">
      <Table>
        <TableHeader>
          <TableRow className="bg-white hover:bg-white">
            <TableHead>Course&nbsp;Number</TableHead>
            <TableHead>Course&nbsp;Name</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Start&nbsp;Time</TableHead>
            <TableHead>End&nbsp;Time</TableHead>
            <TableHead>Professor</TableHead>
            {/* <TableHead>Location</TableHead> */}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.error ? (
            <p>failed to fetch enrolled courses</p>
          ) : sections.isLoading ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="flex justify-center py-36">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : !sections.data || sections.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="flex justify-center py-36">
                  <p>No courses found.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sections.data.map(({ Type: Status, Section }) => {
              const { SectionId, Professor, Start, End } = Section
              const { Code, Name, MinUnits, MaxUnits } = Section.Courses

              return (
                <>
                  <CourseRow key={SectionId} code={Code}>
                    <TableCell>{Code}</TableCell>
                    <TableCell>{Name}</TableCell>
                    <TableCell>{SectionId}</TableCell>
                    <TableCell>
                      {MinUnits === MaxUnits
                        ? MinUnits
                        : `${MinUnits}-${MaxUnits}`}
                    </TableCell>
                    <TableCell>{daysFormat(Section)}</TableCell>
                    <TableCell>{hmFormat(Start)}</TableCell>
                    <TableCell>{hmFormat(End)}</TableCell>
                    <TableCell>{Professor}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "whitespace-nowrap w-32 h-2 py-3 px-1 text-xs font-medium rounded-full flex gap-2 items-center justify-center",
                        Status === Enrolled_Type.Enrolled && "text-green-900 bg-green-200",
                        Status === Enrolled_Type.Waitlist && "text-amber-900 bg-amber-200",
                        Status === Enrolled_Type.ShoppingCart && "text-sky-900 bg-sky-200",
                      )}>
                        {camelAddSpace(Status)}{" "}
                        {Status === Enrolled_Type.Enrolled ? (
                          <CheckCircle2
                            size={10}
                          />
                        ) : Status === Enrolled_Type.Waitlist ? (
                          <AlertCircle
                            size={10}
                          />
                        ) : Status === Enrolled_Type.ShoppingCart ? (
                          <ShoppingCart
                            size={10}
                          />
                        ) : (
                          <HelpCircle
                            size={10}
                          />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 focus-visible:ring-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            id="swap"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSwappingSection(Section)
                            }}
                          >
                            Swap
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            id="drop"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDropClick(Code)
                            }}
                          >
                            Drop
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </CourseRow>

                  <SwapSheet
                    course={
                      sections.data.find(
                        (sections) =>
                          sections.Section.SectionId ===
                          swappingSection?.SectionId
                      )?.Section.Courses
                    }
                    section={swappingSection}
                    setSection={setSwappingSection}
                    onSwap={() => sections.refetch()}
                  />

                  <AlertDialog open={openDrop} onOpenChange={setOpenDrop}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to drop {modifyCourse}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. If this section is
                          waitlisted, you will be placed at the end of the
                          waitlist if you want to add it back.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDropConfirm(SectionId)}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex items-center">
          <Select onValueChange={handleQuarterChange}>
            <SelectTrigger className="w-[180px] focus-visible:ring-0">
              <SelectValue placeholder="Spring 2023" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Spring 2023">Spring 2023</SelectItem>
              <SelectItem value="Winter 2023">Winter 2023</SelectItem>
              <SelectItem value="Fall 2022">Fall 2022</SelectItem>
            </SelectContent>
          </Select>
          <Tabs dir="ltr" defaultValue="list" className="ml-4">
            <TabsList>
              <TabsTrigger value="list" onClick={() => setShowList(true)}>
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" onClick={() => setShowList(false)}>
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <span className="flex justify-end">
          <div className="flex gap-2"> 
            { toggleButtons.map((entry) => (
                <Button
                  key={entry[0]}
                  onClick={() => updateShowingSections(entry[1] as Enrolled_Type)}
                  className={
                    cn(
                      "px-4 w-44 whitespace-nowrap",
                      showingSections.includes(entry[1]) ? 
                        (
                          entry[1] === Enrolled_Type.Enrolled ? 
                            `bg-green-200 hover:bg-green-300 hover:text-green-800 text-green-800 border border-green-500` :
                          entry[1] === Enrolled_Type.Waitlist ?
                            `bg-amber-200 hover:bg-amber-300 hover:text-amber-800 text-amber-800 border border-amber-500` :
                          `bg-sky-200 hover:bg-sky-300 hover:text-sky-800 text-sky-800 border border-sky-500`
                        ) :
                        "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
                    )
                  }
                >
                  {entry[0]} { showingSections.includes(entry[1]) ? "✓" : ""}
                </Button>
            ))}
          </div>
        </span>
      </div>
      {
        showList ? (
          homeTable
        ) : (
          <div className="flex-1 mt-2">
            <WeekCalendar 
              height={calendarHeight} 
              sections={sections.data ? sections.data : []}
              isLoading={sections.isLoading}
              warningMessage={showingSections.length === 0 ? "Please select a section type to view" : undefined}
            />
          </div>
        )
      }
    </div>
  )
}
