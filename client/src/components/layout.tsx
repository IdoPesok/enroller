import { useAuth } from "@clerk/clerk-react"
import { ReactNode, useEffect, useState } from "react"
import { LandingNav } from "./nav/landing-nav"
import { MainNav } from "./nav/main-nav"
import { useRouter } from "next/router"
import { isOnboardingRoute } from "@/lib/routes"

type Props = {
  children: ReactNode
}

export const Layout = ({ children }: Props) => {
  const { userId } = useAuth()
  const [showNav, setShowNav] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isOnboardingRoute(router.pathname)) {
      setShowNav(false)
    } else {
      setShowNav(true)
    }
  }, [router, router.pathname])

  if (!userId) {
    return (
      <>
        <LandingNav>{children}</LandingNav>
      </>
    )
  }

  return (
    <>
      <div className="bg-white">
        { 
          !showNav ? (
            <div className="h-screen w-screen flex justify-center items-center">
              { children }
            </div>
          ) : (
            <>
              <MainNav /> 
              <div className="px-10">
                {children}
              </div>
            </>
          )
        }
      </div>
    </>
  )
}
