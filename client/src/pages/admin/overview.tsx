import { columns } from "@/components/courses/columns"
import { DataTable } from "@/components/courses/data-table"
import { getAdminSectionsColumns } from "@/components/sections/admin-sections-columns"
import { SectionForm } from "@/components/sections/section-form"
import TermSelect from "@/components/term/term-select"
import { Button } from "@/components/ui/button"
import ErrorMessage from "@/components/ui/error-message"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { SectionWithCourse } from "@/interfaces/SectionTypes"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { useRouterQueryState } from "@/lib/use-router-query-state"
import { Courses, Sections } from "@prisma/client"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function Overview() {
  const { toast } = useToast()
  const [updatingSection, setUpdatingSection] = useState<
    SectionWithCourse | undefined
  >(undefined)

  const [search, setSearch] = useRouterQueryState("q", "")
  const [prefixes, setPrefixes] = useRouterQueryState<string[] | undefined>(
    "pre"
  )
  const [professors, setProfessors] = useRouterQueryState<string[] | undefined>(
    "prof"
  )
  const [term, setTerm] = useRouterQueryState<Sections["TermId"] | undefined>(
    "term"
  )

  const debouncedSearch = useDebounce(search, 500)

  const [sheetOpen, setSheetOpen] = useState(false)

  const sections = trpc.sections.retrieve.useInfiniteQuery(
    { search: debouncedSearch, filters: { prefixes, professors }, term },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const adminSectionsColumns = getAdminSectionsColumns({
    handleRefresh: () => sections.refetch(),
    handleEdit: (row) => {
      setUpdatingSection(row.original)
      handleUpdateSheetOpen(true)
    },
  })

  const handleUpdateSheetOpen = (value: boolean) => {
    setSheetOpen(value)

    if (!value) {
      setUpdatingSection(undefined)
    }
  }

  return (
    <div className="mx-auto">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="mt-3">
            Welcome to the admin dashboard! Here you can manage courses, users,
            and more.
          </p>
        </div>
        <SectionForm
          sheetOpen={sheetOpen}
          setSheetOpen={handleUpdateSheetOpen}
          sheetTrigger={
            <Button>
              <Plus className="mr-2" size={16} />
              Create section
            </Button>
          }
          handleCreateSuccess={async () => {
            await sections.refetch()
            handleUpdateSheetOpen(false)
            toast({
              title: "Section created!",
              description: "The section was successfully created.",
              variant: "success", 
            })
          }}
          handleUpdateSuccess={async () => {
            await sections.refetch()
            handleUpdateSheetOpen(false)
            toast({
              title: "Section updated!",
              description: "The section was successfully updated.",
              variant: "success", 
            })
          }}
          updatingSection={updatingSection}
        />
      </div>
      <TermSelect term={term} setTerm={setTerm} />
      {sections.isLoading && search ? (
        <Spinner className="mt-10" />
      ) : sections.error ? (
        <ErrorMessage message={JSON.stringify(sections.error)} />
      ) : (
        <div className="my-6">
          <DataTable
            columns={adminSectionsColumns}
            data={sections.data?.pages.flatMap((s) => s.sections) ?? []}
            isLoading={sections.isLoading}
          />
        </div>
      )}
    </div>
  )
}
