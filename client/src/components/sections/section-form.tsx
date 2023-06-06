import {
  DAYS,
  DaysOfTheWeek,
  SECTION_END_TIMES,
  SECTION_FORMAT_OPTIONS,
  SECTION_MODALITY_OPTIONS,
  SECTION_START_TIMES,
  SectionWithCourse,
  sectionFormSchema,
} from "@/interfaces/SectionTypes"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { addSearchModifiers, cn, getDateTimeFromString } from "@/lib/utils"
import { CheckBadgeIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Courses,
  Sections,
  Sections_Format,
  Sections_Modality,
} from "@prisma/client"
import { ArrowLeftRight, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import CourseCard from "../courses/course-card"
import { Button } from "../ui/button"
import { ButtonSpinner } from "../ui/button-spinner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { Search } from "../ui/search"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Separator } from "../ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import { Spinner } from "../ui/spinner"
import { Toggle } from "../ui/toggle"
import { useToast } from "../ui/use-toast"
import TermSelect from "../term/term-select"

type Props = {
  sheetTrigger: React.ReactNode
  handleCreateSuccess: () => void
  handleUpdateSuccess: () => void
  updatingSection?: SectionWithCourse
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
}

export const SectionForm = ({
  sheetTrigger,
  handleCreateSuccess,
  handleUpdateSuccess,
  updatingSection,
  sheetOpen,
  setSheetOpen,
}: Props) => {
  const terms = trpc.term.list.useQuery()

  const form = useForm<z.infer<typeof sectionFormSchema>>({
    resolver: zodResolver(sectionFormSchema),
  })

  const { toast } = useToast()

  // course search state
  const [selectedCourse, setSelectedCourse] = useState<null | Courses>(
    updatingSection ? updatingSection?.Courses ?? null : null
  )
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const courses = trpc.courses.list.useInfiniteQuery(
    { search: addSearchModifiers(debouncedSearch), filters: {} },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(debouncedSearch),
    }
  )

  // restore to default values on open
  useEffect(() => {
    if (sheetOpen) {
      const activeDays: DaysOfTheWeek[] = []
      let startTime: string | undefined = undefined
      let endTime: string | undefined = undefined

      if (updatingSection) {
        for (const d of [
          [DaysOfTheWeek.Monday, updatingSection.Monday],
          [DaysOfTheWeek.Tuesday, updatingSection.Tuesday],
          [DaysOfTheWeek.Wednesday, updatingSection.Wednesday],
          [DaysOfTheWeek.Thursday, updatingSection.Thursday],
          [DaysOfTheWeek.Friday, updatingSection.Friday],
          [DaysOfTheWeek.Saturday, updatingSection.Saturday],
          [DaysOfTheWeek.Sunday, updatingSection.Sunday],
        ] as [DaysOfTheWeek, boolean | null][]) {
          if (d[1]) {
            activeDays.push(d[0])
          }
        }

        const startDate = new Date(updatingSection.Start)
        const endDate = new Date(updatingSection.End)

        // 15:10 18:00 needs to be converted to 03:10 PM and 06:00 PM
        startTime = startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        endTime = endDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })

        // convert to 12 hour time
        startTime = startTime.replace(/^(\d{1,2}):(\d{2})$/, (m, h, mm) => {
          return (h % 12 || 12) + ":" + mm + " " + (h < 12 ? "AM" : "PM")
        })

        endTime = endTime.replace(/^(\d{1,2}):(\d{2})$/, (m, h, mm) => {
          return (h % 12 || 12) + ":" + mm + " " + (h < 12 ? "AM" : "PM")
        })
      }

      form.reset({
        professorName: updatingSection?.Professor ?? "",
        activeDays: activeDays,
        startTime: startTime,
        endTime: endTime,
        waitlistCapacity: updatingSection?.WaitlistCapacity ?? 99,
        enrollmentCapacity: updatingSection?.Capacity ?? 30,
        roomNumber: updatingSection?.Room ?? "",
        format: updatingSection?.Format ?? Sections_Format.Lecture,
        modality: updatingSection?.Modality ?? Sections_Modality.InPerson,
      })

      if (updatingSection) {
        setSelectedCourse(updatingSection.Courses)
      } else {
        setSelectedCourse(null)
      }

      setSearch("")
    }
  }, [updatingSection, sheetOpen, form])

  const createMutation = trpc.sections.create.useMutation({
    onSuccess: () => {
      handleCreateSuccess()
    },
    onError: (error) => {
      toast({
        title: "Error creating section",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateMutation = trpc.sections.update.useMutation({
    onSuccess: () => {
      handleUpdateSuccess()
    },
    onError: (error) => {
      toast({
        title: "Error updating section",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const mutation = updatingSection ? updateMutation : createMutation

  function validateStartAndEndTimes(start: Date, end: Date) {
    if (start >= end) {
      return "Start time must be before end time"
    }
    if (end.getTime() - start.getTime() > 3 * 60 * 60 * 1000) {
      return "Section cannot be longer than 3 hours"
    }
    return false
  }

  function onSubmit(values: z.infer<typeof sectionFormSchema>) {
    if (!selectedCourse) return

    // convert start and end from string to date time
    const startDateTime = getDateTimeFromString(values.startTime)
    const endDateTime = getDateTimeFromString(values.endTime)

    const dateErrors = validateStartAndEndTimes(startDateTime, endDateTime)
    if (dateErrors) {
      form.setError("startTime", {
        type: "manual",
        message: dateErrors,
      })
      return
    }

    const sectionData = {
      Course: selectedCourse.Code,
      TermId: values.termId,
      CatalogYear: selectedCourse.CatalogYear,
      Professor: values.professorName,
      Monday: values.activeDays.includes(DaysOfTheWeek.Monday),
      Tuesday: values.activeDays.includes(DaysOfTheWeek.Tuesday),
      Wednesday: values.activeDays.includes(DaysOfTheWeek.Wednesday),
      Thursday: values.activeDays.includes(DaysOfTheWeek.Thursday),
      Friday: values.activeDays.includes(DaysOfTheWeek.Friday),
      Saturday: values.activeDays.includes(DaysOfTheWeek.Saturday),
      Sunday: values.activeDays.includes(DaysOfTheWeek.Sunday),
      Start: startDateTime,
      End: endDateTime,
      WaitlistCapacity: parseInt(values.waitlistCapacity.toString()),
      Capacity: parseInt(values.enrollmentCapacity.toString()),
      Room: values.roomNumber,
      Format: values.format ?? Sections_Format.Lecture,
      Modality: values.modality ?? Sections_Modality.InPerson,
    }

    if (updatingSection) {
      updateMutation.mutate({
        SectionId: updatingSection.SectionId,
        updateData: sectionData,
      })
    } else {
      createMutation.mutate(sectionData)
    }
  }

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map((course) => (
      <CourseCard
        key={course.Code}
        course={course}
        linkButton={
          <Button
            className="mt-5 bg-emerald-500 hover:bg-emerald-600"
            onClick={() => setSelectedCourse(course)}
          >
            <ArrowRight className="mr-2 h-4" />
            Next
          </Button>
        }
      />
    ))

  const courseSearch = (
    <div className="px-1 overflow-hidden flex-1 flex flex-col">
      <Search
        className="w-full h-10 my-4 mt-2 flex-none"
        placeholder="Search for classes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-y-auto flex-1">
        {!search ? (
          <div className="flex flex-col items-center justify-center h-24">
            <p className="text-center text-gray-500">
              Search for the class to make a section for.
            </p>
          </div>
        ) : cards ? (
          <>
            {cards.length > 0 ? (
              cards
            ) : (
              <p className="text-center mt-3">
                No courses meet search criteria
              </p>
            )}
            {courses.hasNextPage && (
              <Button
                className="w-full mt-6"
                onClick={() => courses.fetchNextPage()}
              >
                Load More
              </Button>
            )}
          </>
        ) : (
          courses.isFetching && search && <Spinner className="mt-3" />
        )}
      </div>
    </div>
  )

  const sectionForm = selectedCourse ? (
    <>
      <div className="bg-slate-100 flex justify-between p-3 rounded items-center flex-none transition-opacity">
        <div className="flex gap-2 items-center">
          <CheckBadgeIcon className="text-slate-500 h-6" />
          Class selected
        </div>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 h-8"
          onClick={() => setSelectedCourse(null)}
        >
          <ArrowLeftRight className="h-4 mr-2 w-4" />
          {selectedCourse.Code}
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="termId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term</FormLabel>
                <FormControl>
                  <TermSelect term={field.value} setTerm={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="professorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Professor Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Number</FormLabel>
                <FormControl>
                  <Input placeholder="Room Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-10">
            <FormField
              control={form.control}
              name="enrollmentCapacity"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Enrolled Capacity</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enrolled Capacity"
                      {...field}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="waitlistCapacity"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Waitlist Capacity</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Waitlist Capacity"
                      {...field}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className="my-5" />
          <div className="flex gap-10">
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Format</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {SECTION_FORMAT_OPTIONS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modality"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Modality</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select modality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {SECTION_MODALITY_OPTIONS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-10">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {SECTION_START_TIMES.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {SECTION_END_TIMES.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="activeDays"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Meeting Days</FormLabel>
                <FormControl>
                  <div className="col-span-3 flex gap-3 rounded p-2 border border-slate-200">
                    {DAYS.map((day) => (
                      <Toggle
                        key={day}
                        className="flex-1"
                        pressed={field.value.includes(day)}
                        onPressedChange={(v) =>
                          form.setValue(
                            "activeDays",
                            v
                              ? [...field.value, day]
                              : field.value.filter((d) => d !== day)
                          )
                        }
                      >
                        {day}
                      </Toggle>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SheetFooter>
            <Button
              type="submit"
              disabled={mutation.isLoading}
              className={cn(
                mutation.isLoading ? "bg-slate-300 cursor-not-allowed" : ""
              )}
            >
              {mutation.isLoading ? (
                <>
                  <ButtonSpinner className="mr-2" />
                  <>{updatingSection ? "Updating" : "Creating"} section...</>
                </>
              ) : (
                <>{updatingSection ? "Update" : "Create"} section</>
              )}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </>
  ) : null

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>{sheetTrigger}</SheetTrigger>
      <SheetContent
        position="right"
        size="lg"
        className="flex flex-col overflow-y-auto"
      >
        <SheetHeader className="flex-none">
          <SheetTitle>
            {updatingSection ? "Update" : "Create"} section
          </SheetTitle>
          <SheetDescription>
            {updatingSection ? (
              <>Update the section for students.</>
            ) : (
              <>Add a new section for students to join.</>
            )}
          </SheetDescription>
        </SheetHeader>
        {!selectedCourse ? courseSearch : sectionForm}
      </SheetContent>
    </Sheet>
  )
}
