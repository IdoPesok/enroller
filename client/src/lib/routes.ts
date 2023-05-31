export const STUDENT_NAMESPACE = "/student"
export const ADMIN_NAMESPACE = "/admin"
export const ONBOARDING_NAMESPACE = "/onboarding"

export const generateRoute = (namespace: string, route: string) => {
  let cleanedRoute = route
  if (cleanedRoute.startsWith("/")) {
    cleanedRoute = cleanedRoute.substring(1)
  }

  if (!cleanedRoute) {
    return namespace
  }

  return namespace + "/" + cleanedRoute
}

export const generateStudentRoute = (route: string) =>
  generateRoute(STUDENT_NAMESPACE, route)
export const generateAdminRoute = (route: string) =>
  generateRoute(ADMIN_NAMESPACE, route)
export const generateOnboardingRoute = (route: string) =>
  generateRoute(ONBOARDING_NAMESPACE, route)

// Set the paths that don't require the user to be signed in
const publicPaths = ["/", "/sign-in*", "/sign-up*"]
const errorPaths = ["/404"]

export const isPublicRoute = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  )
}

export const isErrorPath = (path: string) => {
  return errorPaths.includes(path)
}

export const isApiPath = (path: string) => {
  return path.startsWith("/api")
}

export const isAdminRoute = (path: string) => {
  return path.startsWith(generateAdminRoute(""))
}

export const isStudentRoute = (path: string) => {
  return path.startsWith(generateStudentRoute(""))
}

export const isOnboardingRoute = (path: string) => {
  return path.startsWith(generateOnboardingRoute(""))
}

export enum RouteType {
  PUBLIC = 1,
  ADMIN = 2,
  STUDENT = 3,
  ONBOARDING = 4,
}

export const getRouteType = (path: string): RouteType | null => {
  let currentRouteType: RouteType | null = null

  if (isAdminRoute(path)) {
    currentRouteType = RouteType.ADMIN
  } else if (isStudentRoute(path)) {
    currentRouteType = RouteType.STUDENT
  } else if (isOnboardingRoute(path)) {
    currentRouteType = RouteType.ONBOARDING
  } else if (isPublicRoute(path)) {
    currentRouteType = RouteType.PUBLIC
  }

  return currentRouteType
}
