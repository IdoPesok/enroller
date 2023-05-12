import { useAuth } from "@clerk/clerk-react"
import { ReactNode, useEffect, useState } from "react"
import { LandingNav } from "./nav/landing-nav"
import { MainNav } from "./nav/main-nav"
import { useRouter } from "next/router"
import { RouteType, getRouteType } from "@/lib/routes"
import { LoadingPage } from "./loading/loading-page"

type Props = {
  children: ReactNode
}

export const Layout = ({ children }: Props) => {
  const { userId } = useAuth()
  const [routeType, setRouteType] = useState<RouteType | null>(null)
  const router = useRouter()

  useEffect(() => {
    const rt = getRouteType(router.pathname)
    setRouteType(rt);
  }, [router, router.pathname])

  if (!userId) {
    return (
      (routeType === RouteType.PUBLIC) ? (<>
        <LandingNav>{children}</LandingNav>
      </>) : (
        <LoadingPage />
      )
    )
  }

  return (
    <>
      <div className="bg-white">
        { 
          (routeType === RouteType.ONBOARDING) ? (
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
