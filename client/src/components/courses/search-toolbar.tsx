import { STOPWORDS } from "@/lib/utils"
import { Search } from "../ui/search"
import { Option, SearchFilterCombobox } from "./search-filter"

interface SearchToolbarProps {
  search: string
  setSearch: (search: string) => void
  prefixOptions: Option[]
  prefixes: string[] | undefined
  setPrefixes: (prefixes: string[] | undefined) => void
}

export function SearchToolbar({
  search,
  setSearch,
  prefixOptions,
  prefixes,
  setPrefixes,
}: SearchToolbarProps) {
  return (
    <div className="flex gap-1">
      <Search
        className="flex-1 max-w-xl h-10"
        placeholder="Search for classes..."
        value={search}
        onChange={(e) => setSearch(e.target.value.trim())}
      />
      <SearchFilterCombobox
        options={prefixOptions}
        values={prefixes}
        setValues={setPrefixes}
      />
    </div>
  )
}
