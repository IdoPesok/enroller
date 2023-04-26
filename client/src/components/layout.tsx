import { useAuth } from "@clerk/clerk-react"
import { ReactNode } from "react"
import { LandingNav } from "./nav/landing-nav"
import { MainNav } from "./nav/main-nav"

type Props = {
  children: ReactNode
}

export const Layout = ({ children }: Props) => {
  const { userId } = useAuth()

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
        <MainNav />
        {children}
      </div>
    </>
  )
}
