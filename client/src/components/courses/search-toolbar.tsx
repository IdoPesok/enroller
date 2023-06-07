import { STOPWORDS, cn } from "@/lib/utils"
import { Search } from "../ui/search"
import { Option, SearchFilterCombobox } from "./search-filter"
import TermSelect from "../term/term-select"

export interface Filters {
  prefixOptions: Option[]
  prefixes?: string[]
  setPrefixes: (prefixes: string[] | undefined) => void
}

interface SearchToolbarProps {
  search: string
  setSearch: (search: string) => void
  filters?: Filters
  term?: number
  setTerm?: (term?: number) => void
}

export function SearchToolbar({
  search,
  setSearch,
  filters,
  term,
  setTerm,
}: SearchToolbarProps) {
  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex gap-1 flex-1 items-center">
        <Search
          className={cn(
            filters && "flex-1 max-w-xl",
            !filters && "w-full",
            "h-10"
          )}
          placeholder="Search for classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filters && (
          <SearchFilterCombobox
            options={filters.prefixOptions}
            values={filters.prefixes}
            setValues={filters.setPrefixes}
          />
        )}
      </div>
      {setTerm && (
        <div className="ml-10">
          <TermSelect term={term} setTerm={setTerm} />
        </div>
      )}
    </div>
  )
}
