import * as React from "react"

import { cn } from "@/lib/utils"
import { SearchIcon } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Search = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="flex items-center justify-end border border-input file:border-0 rounded-lg focus-within:ring-2 focus-within:ring-ring">
        <SearchIcon className="ml-3" />
        <input
          type={type ?? "search"}
          className={cn(
            "flex h-10 w-full rounded-md bg-transparent px-3 py-2 mr-2 text-sm ring-offset-background file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Search.displayName = "Search"

export { Search }
