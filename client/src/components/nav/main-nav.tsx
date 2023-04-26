import { UserButton } from "@clerk/nextjs"
import { useRouter } from 'next/router'
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Course Search", href: "/courses" },
  { name: "Shopping Cart", href: "/cart" },
  { name: "Enroll", href: "/enroll" },
  { name: "Drop", href: "/drop" },
]

interface HighlightBarSize {
  left: number,
  width: number
}

export const MainNav = () => {
  const router = useRouter()
  const [activeRoute, setActiveRoute] = useState(router.pathname)
  const [highlightBarSize, setHighlightBarSize] = useState<HighlightBarSize>({ left: 0, width: 0 })

  const getHighlightBarSize = (): HighlightBarSize => {
    const navItems = document.querySelectorAll("#main-nav-active")
    console.log(navItems)
    if (navItems.length === 0) return { left: 0, width: 0 }
    const navItem = navItems[0] as HTMLElement
    return { left: navItem.offsetLeft - 4, width: navItem.offsetWidth + 8 }
  }

  useEffect(() => {
    setActiveRoute(router.pathname)
    setHighlightBarSize(getHighlightBarSize())
  }, [router.pathname])

  return (
    <>
      <div className="width-screen px-12 py-4 flex gap-6 flex-col border border-slate-200 mb-10 relative">
        <div className="justify-between flex items-center">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 text-emerald-500 mr-5" />
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-md mx-2",
                  activeRoute === item.href && "text-black font-semibold "
                )}
                id={activeRoute === item.href ? "main-nav-active" : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>
          <UserButton />
        </div>
        <div 
          className="bottom-0 w-48 h-px bg-emerald-500 absolute z-10 left-20" 
          style={highlightBarSize}
        />
      </div>
    </>
  )
}
