import WeekCalendar from "@/components/WeekCalendar/WeekCalendar"
import ShoppingCart from "@/components/enroll/shopping-cart"
import TermSelect from "@/components/term/term-select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc"
import { useRouterQueryState } from "@/lib/use-router-query-state"
import { Enrolled_Type, Sections } from "@prisma/client"
import { useState } from "react"

export default function Enroll() {
  const [viewType, setViewType] = useState<"all sections" | "cart only">(
    "all sections"
  )
  const [hiddenSections, setHiddenSections] = useState<number[]>([])

  const [term, setTerm] = useRouterQueryState<Sections["TermId"] | undefined>(
    "term",
    undefined,
    {
      isNumber: true
    }
  )

  const sections = trpc.home.userSections.useQuery(
    {
      types:
        viewType === "all sections"
          ? [
              Enrolled_Type.ShoppingCart,
              Enrolled_Type.Enrolled,
              Enrolled_Type.Waitlist,
            ]
          : [Enrolled_Type.ShoppingCart],
      quarter: term,
    },
    {
      enabled: Boolean(term),
    }
  )

  // update hidden sections
  const handleHideSection = (sectionId: number) => {
    if (hiddenSections.includes(sectionId)) {
      setHiddenSections(hiddenSections.filter((id) => id !== sectionId))
    } else {
      setHiddenSections([...hiddenSections, sectionId])
    }
  }

  const filteredSections = sections.data?.filter(
    (section) => !hiddenSections.includes(section.SectionId)
  )

  return (
    <>
      <div className="flex gap-5">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              Enrolling For:
              <TermSelect term={term} setTerm={setTerm} />
            </div>
            <Tabs dir="ltr" value={viewType} defaultValue={"all sections"}>
              <TabsList>
                <TabsTrigger
                  value={"all sections"}
                  onClick={() => setViewType("all sections")}
                >
                  Full schedule
                </TabsTrigger>
                <TabsTrigger
                  value={"cart only"}
                  onClick={() => setViewType("cart only")}
                >
                  Cart only
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <WeekCalendar
            heightOffset={210}
            sections={filteredSections ?? []}
            isLoading={sections.isLoading}
          />
        </div>
        <ShoppingCart
          hiddenSections={hiddenSections}
          handleHideSection={handleHideSection}
          quarter={term}
        />
      </div>
    </>
  )
}
