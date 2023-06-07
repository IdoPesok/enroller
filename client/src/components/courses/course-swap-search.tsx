import { Button } from "@/components/ui/button"
import ScrollToTopButton from "@/components/ui/scroll-to-top"
import { Spinner } from "@/components/ui/spinner"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { STOPWORDS } from "@/lib/utils"
import { SearchToolbar } from "@/components/courses/search-toolbar"
import React, { useState } from "react"
import CourseSwapCard, { ConfirmSwapData } from "./course-swap-card"
import { Enrolled_Type, Sections } from "@prisma/client"
import { useAuth } from "@clerk/nextjs"
import ScheduleChangePreview from "./schedule-change-preview"
import { useToast } from "../ui/use-toast"
import SkeletonCourseCard from "./skeleton-course-card"

function addSearchModifiers(search: string): string {
  return search
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .map((w) => `+${w}*`)
    .join(" ")
}

interface Props {
  swapSection: Sections
  setSwapSection: (section?: Sections | null) => void
  search: string
  setSearch: (search: string) => void
  onSwap: () => void
  quarter: string | undefined
}

export default function CourseSwapSearch({
  swapSection,
  setSwapSection,
  search,
  setSearch,
  onSwap,
  quarter,
}: Props) {
  const [confirmingSectionData, setConfirmingSectionData] =
    useState<ConfirmSwapData | null>(null)
  const debouncedSearch = useDebounce(search, 500)
  const { userId } = useAuth()
  const utils = trpc.useContext()

  const sections = trpc.sections.list.useQuery(
    { code: confirmingSectionData?.course.Code, term: parseInt(quarter!) },
    {
      enabled: !!confirmingSectionData && !!quarter,
    }
  )

  const courses = trpc.courses.list.useInfiniteQuery(
    {
      search: addSearchModifiers(debouncedSearch.trim()),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: Boolean(debouncedSearch),
    }
  )

  const { toast } = useToast()

  const updateMutation = trpc.enroll.update.useMutation({
    onMutate: async (updatedEnroll) => {
      await utils.enroll.list.cancel()
      const oldEnrolls = utils.enroll.list.getData()
      const oldSection = swapSection
      utils.enroll.list.setData(undefined, (old) =>
        old?.map((enroll) =>
          enroll.SectionId === updatedEnroll.SectionId
            ? { User: userId!, ...updatedEnroll.Data }
            : enroll
        )
      )
      setSwapSection(
        sections.data?.find(
          (secion) => secion.SectionId === updatedEnroll.Data.SectionId
        )
      )
      return { oldEnrolls, oldSection }
    },
    onError: (error, variables, context) => {
      utils.enroll.list.setData(undefined, context?.oldEnrolls)
      setSwapSection(context?.oldSection)
    },
    onSettled: (data, error, variables, context) => {
      utils.enroll.invalidate()
      utils.home.invalidate()
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your schedule has been updated.",
      })
    },
  })

  const cards = courses.data?.pages
    .flatMap(({ courses }) => courses)
    .map((course) => (
      <CourseSwapCard
        key={course.Code}
        confirmSwap={setConfirmingSectionData}
        quarter={quarter}
        course={course}
      />
    ))

  return (
    <>
      {confirmingSectionData !== null ? (
        <ScheduleChangePreview
          oldSectionId={swapSection.SectionId}
          quarter={quarter}
          newSectionId={confirmingSectionData.sectionId}
          onCancel={() => setConfirmingSectionData(null)}
          onConfirm={() => {
            updateMutation.mutate({
              SectionId: swapSection.SectionId,
              Data: {
                Type: Enrolled_Type.Enrolled,
                Seat: null,
                SectionId: confirmingSectionData.sectionId,
              },
            })
            setConfirmingSectionData(null)
            onSwap()
          }}
        />
      ) : (
        <div className="mx-auto max-w-4xl pt-10">
          <ScrollToTopButton />
          <SearchToolbar search={search} setSearch={setSearch} />
          {cards ? (
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
            courses.isFetching && search && <SkeletonCourseCard />
          )}
        </div>
      )}
    </>
  )
}
