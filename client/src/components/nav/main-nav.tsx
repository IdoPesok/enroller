import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/router"
import { AcademicCapIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  generateAdminRoute,
  generateStudentRoute,
  isAdminRoute,
  isStudentRoute,
} from "@/lib/routes"
import { doesUserNeedOnboarding, isUserAdmin } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ArrowDown, LogOut, RotateCcw } from "lucide-react"
import { trpc } from "@/lib/trpc"

interface NavigationItem {
  name: string
  href: string
}

const STUDENT_NAVIGATION: NavigationItem[] = [
  { name: "Home", href: generateStudentRoute("/home") },
  { name: "Course Search", href: generateStudentRoute("/courses") },
  { name: "Enroll", href: generateStudentRoute("/enroll") },
  { name: "Degree Progress", href: generateStudentRoute("/degree-progress") },
  { name: "Explore", href: generateStudentRoute("/explore") },
]

const ADMIN_NAVIGATION: NavigationItem[] = [
  { name: "Overview", href: generateAdminRoute("/overview") },
]

interface HighlightBarSize {
  left: number
  width: number
}

export const MainNav = () => {
  const router = useRouter()
  const [activeRoute, setActiveRoute] = useState(router.pathname)
  const [highlightBarSize, setHighlightBarSize] =
    useState<HighlightBarSize | null>(null)
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const user = useUser()
  const { signOut } = useClerk()

  useEffect(() => {
    const getHighlightBarSize = (): HighlightBarSize | null => {
      const navItems = document.querySelectorAll("#main-nav-active")
      if (navItems.length === 0) return null
      const navItem = navItems[0] as HTMLElement
      return { left: navItem.offsetLeft - 4, width: navItem.offsetWidth + 8 }
    }

    const handleRouteChange = () => {
      setActiveRoute(router.pathname)

      if (isAdminRoute(router.pathname)) {
        setNavItems(ADMIN_NAVIGATION)
      } else if (isStudentRoute(router.pathname)) {
        setNavItems(STUDENT_NAVIGATION)
      } else {
        setNavItems([])
      }

      setTimeout(() => {
        setHighlightBarSize(getHighlightBarSize())
      }, 50)
    }

    router.events.on("routeChangeComplete", handleRouteChange)

    handleRouteChange()

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [router])

  const resetMutation = trpc.onboard.resetOnboarding.useMutation({
    onSuccess: () => {
      router.reload()
    },
  })
  const resetOnboarding = async () => {
    await resetMutation.mutate()
  }

  const demoteUserRoleMutation = trpc.auth.demoteUserRole.useMutation({
    onSuccess: () => {
      router.reload()
    },
  })
  const demoteUserRole = async () => {
    await demoteUserRoleMutation.mutate()
  }

  const navLinks = navItems.map((item) => (
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
  ))

  return (
    <>
      <div className="width-screen px-12 py-4 flex gap-6 flex-col border border-slate-200 mb-8 sticky top-0 left-0 bg-white">
        <div className="justify-between flex items-center">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 text-emerald-500 mr-5" />
            {navLinks.length > 0 && navLinks}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user?.profileImageUrl} alt="@shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {user.user?.firstName && (
                    <p className="text-sm font-medium leading-none">
                      {user.user?.firstName} {user.user?.lastName}
                    </p>
                  )}
                  {user.user?.primaryEmailAddress && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.user?.primaryEmailAddress.emailAddress}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isUserAdmin(user.user?.publicMetadata) &&
                !doesUserNeedOnboarding(user.user?.publicMetadata) && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => resetOnboarding()}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        <span>Reset Onboarding</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}
              {isUserAdmin(user.user?.publicMetadata) && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => demoteUserRole()}>
                      <ArrowDown className="mr-2 h-4 w-4" />
                      <span>Demote User Role</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {highlightBarSize && (
          <div
            className="bottom-0 w-0 h-px bg-emerald-500 absolute z-10 left-20 transition-all duration-100 ease-in-out"
            style={highlightBarSize}
          />
        )}
      </div>
    </>
  )
}
