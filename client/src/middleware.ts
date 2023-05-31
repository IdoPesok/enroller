import { withClerkMiddleware, getAuth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  RouteType,
  generateAdminRoute,
  generateOnboardingRoute,
  generateStudentRoute,
  getRouteType,
  isAdminRoute,
  isApiPath,
  isErrorPath,
  isOnboardingRoute,
  isPublicRoute,
  isStudentRoute,
} from "./lib/routes"
import { doesUserNeedOnboarding, isUserAdmin } from "./lib/auth"

export default withClerkMiddleware(async (request: NextRequest) => {
  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request)
  const user = userId ? await clerkClient.users.getUser(userId) : null

  const redirectTo404 = () => {
    return NextResponse.redirect(new URL("/404", request.url))
  }

  if (
    isErrorPath(request.nextUrl.pathname) ||
    isApiPath(request.nextUrl.pathname)
  ) {
    return NextResponse.next()
  }

  // figure out the current route being requested
  let currentRouteType: RouteType | null = getRouteType(
    request.nextUrl.pathname
  )

  if (currentRouteType === null) {
    return redirectTo404()
  }

  // setup redirect urls
  const redirectMap: Map<RouteType, URL> = new Map()
  redirectMap.set(RouteType.PUBLIC, new URL("/", request.url))
  redirectMap.set(
    RouteType.ADMIN,
    new URL(generateAdminRoute("overview"), request.url)
  )
  redirectMap.set(
    RouteType.STUDENT,
    new URL(generateStudentRoute("home"), request.url)
  )
  redirectMap.set(
    RouteType.ONBOARDING,
    new URL(generateOnboardingRoute(""), request.url)
  )

  // define all the conditions that need to be true in order to visit a page
  const routeValidMap: Map<RouteType, boolean> = new Map()
  routeValidMap.set(RouteType.PUBLIC, !Boolean(userId))
  routeValidMap.set(
    RouteType.ADMIN,
    user !== null && isUserAdmin(user.publicMetadata)
  )
  routeValidMap.set(
    RouteType.ONBOARDING,
    Boolean(userId) &&
      user !== null &&
      doesUserNeedOnboarding(user.publicMetadata)
  )
  routeValidMap.set(
    RouteType.STUDENT,
    user !== null &&
      !isUserAdmin(user.publicMetadata) &&
      !doesUserNeedOnboarding(user.publicMetadata)
  )

  // check if the current route is not valid
  if (
    routeValidMap.has(currentRouteType) &&
    routeValidMap.get(currentRouteType) === false
  ) {
    // if not valid, find the first valid route and redirect to it
    const validRoute = Array.from(routeValidMap.keys()).find(
      (key) => routeValidMap.get(key) === true
    )
    const redirectUrl =
      validRoute !== undefined ? redirectMap.get(validRoute) : null
    if (validRoute && redirectUrl) {
      return NextResponse.redirect(redirectUrl)
    } else {
      redirectTo404()
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: "/((?!_next/image|_next/static|favicon.ico).*)",
}
