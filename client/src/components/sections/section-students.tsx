import { SectionWithCourse } from "@/interfaces/SectionTypes"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet"
import { trpc } from "@/lib/trpc"
import ErrorMessage from "../ui/error-message"
import { getEnrolledUsersColumns } from "./enrolled-users-columns"
import { DataTable } from "../courses/data-table"
import { useToast } from "../ui/use-toast"

type Props = {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  section?: SectionWithCourse
}

export const SectionStudents = ({
  sheetOpen,
  setSheetOpen,
  section,
}: Props) => {
  const { toast } = useToast()
  const utils = trpc.useContext()

  const usersEnrolled = trpc.enroll.usersEnrolledInSection.useQuery(
    {
      SectionId: section ? section.SectionId : -1,
    },
    {
      enabled: !!section,
    }
  )

  const unenrollMutation = trpc.enroll.unenrollUser.useMutation({
    onSuccess: async () => {
      await usersEnrolled.refetch()
      toast({
        title: "Unenroll success!",
        description: "The user was successfully removed from this section.",
        variant: "success",
      })
      utils.sections.retrieve.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error unenrolling the user",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const columns = getEnrolledUsersColumns({
    handleUnenroll(row) {
      if (unenrollMutation.isLoading) return
      unenrollMutation.mutate({
        SectionId: row.original.SectionId,
        UserId: row.original.User,
      })
    },
  })

  if (!section) return null

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent
        position="right"
        size="xl"
        className="flex flex-col overflow-y-auto"
      >
        <SheetHeader className="flex-none">
          <SheetTitle>Section enrollment</SheetTitle>
          <SheetDescription>
            Manage section enrollment for students in {section.Course} (
            {section.SectionId})
          </SheetDescription>
        </SheetHeader>
        {usersEnrolled.error ? (
          <ErrorMessage message={JSON.stringify(usersEnrolled.error)} />
        ) : (
          <div className="my-6">
            <DataTable
              showToolbar={false}
              errorMessage="Failed to fetch enrolled users."
              isError={usersEnrolled.isError}
              columns={columns}
              data={usersEnrolled.data ?? []}
              isLoading={usersEnrolled.isLoading}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
