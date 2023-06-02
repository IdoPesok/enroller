import { STOPWORDS, cn } from "@/lib/utils"
import { Search } from "../ui/search"
import { Option, SearchFilterCombobox } from "./search-filter"

export interface Filters {
  prefixOptions: Option[]
  prefixes?: string[]
  setPrefixes: (prefixes: string[] | undefined) => void
}

interface SearchToolbarProps {
  search: string
  setSearch: (search: string) => void
  filters?: Filters
}

export function SearchToolbar({
  search,
  setSearch,
  filters,
}: SearchToolbarProps) {
  return (
    <div className="flex gap-1">
      <Search
        className={cn(
          filters && "flex-1 max-w-xl",
          !filters && "w-full",
          "h-10 mb-4"
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
  )
}
