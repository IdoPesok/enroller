import { DAYS, DaysOfTheWeek, SECTION_END_TIMES, SECTION_FORMAT_OPTIONS, SECTION_MODALITY_OPTIONS, SECTION_START_TIMES, sectionFormSchema } from "@/interfaces/SectionTypes";
import useDebounce from "@/lib/debounce";
import { trpc } from "@/lib/trpc";
import { addSearchModifiers, cn, getDateTimeFromString } from "@/lib/utils";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Courses, Sections_Format, Sections_Modality } from "@prisma/client";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import CourseCard from "../courses/course-card";
import { Button } from "../ui/button";
import { ButtonSpinner } from "../ui/button-spinner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Search } from "../ui/search";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import { Toggle } from "../ui/toggle";
import { useToast } from "../ui/use-toast";

type Props = {
  sheetTrigger: React.ReactNode
  handleSuccess: () => void
}

export const CreateSection = ({ sheetTrigger, handleSuccess }: Props) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const form = useForm<z.infer<typeof sectionFormSchema>>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      professorName: "",
      activeDays: [],
      startTime: undefined,
      endTime: undefined,
      waitlistCapacity: 99,
      enrollmentCapacity: 30,
      roomNumber: "",
      format: Sections_Format.Lecture,
      modality: Sections_Modality.InPerson,
    },
  })

  const { toast } = useToast()

  // course search state
  const [selectedCourse, setSelectedCourse] = useState<null | Courses>(null);
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const courses = trpc.courses.list.useInfiniteQuery(
    { search: addSearchModifiers(debouncedSearch), filters: { } },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(debouncedSearch),
    }
  )

  const mutation = trpc.section.create.useMutation({
    onSuccess: () => {
      setSheetOpen(false)
      handleSuccess()
    },
    onError: (error) => {
      toast({
        title: "Error creating section",
        description: error.message,
        variant: "destructive"
      })
    }
  })

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
    const startDateTime = getDateTimeFromString(values.startTime);
    const endDateTime = getDateTimeFromString(values.endTime);

    const dateErrors = validateStartAndEndTimes(startDateTime, endDateTime)
    if (dateErrors) {
      form.setError("startTime", {
        type: "manual",
        message: dateErrors
      })
      return
    }

    mutation.mutate({
      Course: selectedCourse.Code,
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
    })
  }

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map((course) => (
      <CourseCard 
        key={course.Code} 
        course={course} 
        linkButton={
          <Button className="mt-5 bg-emerald-500 hover:bg-emerald-600" onClick={() => setSelectedCourse(course)}>
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
        {
          !search ? (
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
              <p className="text-center mt-3">No courses meet search criteria</p>
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

  const sectionForm = (
    selectedCourse ? (<>
      <div className="bg-slate-100 flex justify-between p-3 rounded items-center flex-none transition-opacity">
        <div className="flex gap-2 items-center">
          <CheckBadgeIcon className="text-slate-500 h-6" />
          Class selected
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 h-8" onClick={() => setSelectedCourse(null)}>
          <ArrowLeftRight className="h-4 mr-2 w-4" />
          { selectedCourse.Code }
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <Input placeholder="Enrolled Capacity" {...field} />
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
                    <Input placeholder="Waitlist Capacity" {...field} />
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
                          {
                            SECTION_FORMAT_OPTIONS.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))
                          }
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
                          {
                            SECTION_MODALITY_OPTIONS.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))
                          }
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
                          {
                            SECTION_START_TIMES.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))
                          }
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
                          {
                            SECTION_END_TIMES.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))
                          }
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
                  <div className="col-span-3 flex gap-3 rounded p-2 border border-slate-200" >
                    {
                      DAYS.map((day) => (
                        <Toggle
                          key={day}
                          className="flex-1"
                          pressed={field.value.includes(day)}
                          onPressedChange={(v) => form.setValue('activeDays', v ? [...field.value, day] : field.value.filter((d) => d !== day))}
                        >
                          {day}
                        </Toggle>
                      ))
                    }
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
              className={
                cn(
                  mutation.isLoading ? "bg-slate-300 cursor-not-allowed" : ""
                )
              }
            >
              {
                mutation.isLoading ? (
                  <>
                    <ButtonSpinner className="mr-2" />
                    Creating section...
                  </>
                ) : (
                  "Create section"
                )
              }
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </>) : null
  )

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        { sheetTrigger }
      </SheetTrigger>
      <SheetContent position="right" size="lg" className="flex flex-col overflow-y-auto">
        <SheetHeader className="flex-none">
          <SheetTitle>Create section</SheetTitle>
          <SheetDescription>
            Add a new section for students to join.
          </SheetDescription>
        </SheetHeader>
        {
          !selectedCourse ? courseSearch : sectionForm
        }
      </SheetContent>
    </Sheet>
  )
}