import { UserButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { generateAdminRoute, generateStudentRoute, isUserAdmin } from "@/lib/auth"
import Link from "next/link"

const STUDENT_NAVIGATION = [
  { name: "Course Search", href: generateStudentRoute("/courses") },
  { name: "Shopping Cart", href: generateStudentRoute("/cart") },
  { name: "Enroll", href: generateStudentRoute("/enroll") },
  { name: "Drop", href: generateStudentRoute("/drop") },
  { name: "Explore", href: generateStudentRoute("/explore") },
]

const ADMIN_NAVIGATION = [
  { name: "Overview", href: generateAdminRoute("/overview") },
]

interface HighlightBarSize {
  left: number,
  width: number,
}

export const MainNav = () => {
  const router = useRouter()
  const [activeRoute, setActiveRoute] = useState(router.pathname)
  const [highlightBarSize, setHighlightBarSize] = useState<HighlightBarSize | null>(null)
  const user = useUser()

  useEffect(() => {
    const getHighlightBarSize = (): HighlightBarSize | null => {
      const navItems = document.querySelectorAll("#main-nav-active")
      if (navItems.length === 0) return null;
      const navItem = navItems[0] as HTMLElement
      return { left: navItem.offsetLeft - 4, width: navItem.offsetWidth + 8 }
    }

    const handleRouteChange = () => {
      setActiveRoute(router.pathname)

      setTimeout(() => {
        setHighlightBarSize(getHighlightBarSize())
      }, 50)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    handleRouteChange()

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return (
    <>
      <div className="width-screen px-12 py-4 flex gap-6 flex-col border border-slate-200 mb-10 sticky top-0 left-0 bg-white">
        <div className="justify-between flex items-center">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 text-emerald-500 mr-5" />
            { (isUserAdmin(user.user?.publicMetadata) ? ADMIN_NAVIGATION : STUDENT_NAVIGATION).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-md mx-2 transition-colors duration-100 ease-in-out",
                  activeRoute === item.href && "text-black font-semibold "
                )}
                id={activeRoute === item.href ? "main-nav-active" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <UserButton />
        </div>
        {
          highlightBarSize && (
            <div
              className="bottom-0 w-0 h-px bg-emerald-500 absolute z-10 left-20 transition-all duration-100 ease-in-out"
              style={highlightBarSize}
            />
          )
        }
      </div>
    </>
  )
}
