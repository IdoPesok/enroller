import { columns } from "@/components/courses/columns"
import { DataTable } from "@/components/courses/data-table"
import { CreateSection } from "@/components/sections/create-section"
import { Button } from "@/components/ui/button"
import ErrorMessage from "@/components/ui/error-message"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import useDebounce from "@/lib/debounce"
import { trpc } from "@/lib/trpc"
import { useRouterQueryState } from "@/lib/use-router-query-state"
import { Plus } from "lucide-react"

export default function Overview() {
  const { toast } = useToast()
  const [search, setSearch] = useRouterQueryState("q", "")
  const [prefixes, setPrefixes] = useRouterQueryState<string[] | undefined>("pre")
  const [professors, setProfessors] = useRouterQueryState<string[] | undefined>("prof")
  const debouncedSearch = useDebounce(search, 500)

  const sections = trpc.section.retrieve.useInfiniteQuery(
    { search: debouncedSearch, filters: { prefixes, professors } },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  return (
    <div className="mx-auto">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="mt-3">
            Welcome to the admin dashboard! Here you can manage courses, users, and
            more.
          </p>
        </div>
        <CreateSection
          sheetTrigger={
            <Button>
              <Plus className="mr-2" size={16} />
              Create section
            </Button>
          }
          handleSuccess={() => {
            toast({
              title: "Section created!",
              description: "The section was successfully created.",
            })
            sections.refetch()
          }}
        />
      </div>
      {
        (sections.isLoading && search) ? (
          <Spinner className="mt-10" />
        ) : (sections.error) ? (
          <ErrorMessage message={JSON.stringify(sections.error)} />
        ) : (
          <DataTable columns={columns} data={sections.data?.pages.flatMap((s) => s.sections) ?? []} />
        )
      }
    </div>
  )
}
