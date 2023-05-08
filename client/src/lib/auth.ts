export const STUDENT_NAMESPACE = "/student"
export const ADMIN_NAMESPACE = "/admin"

export const generateRoute = (namespace: string, route: string) => {
  let cleanedRoute = route
  if (cleanedRoute.startsWith("/")) {
    cleanedRoute = cleanedRoute.substring(1)
  }

  return (namespace + "/" + cleanedRoute)
}

export const generateStudentRoute = (route: string) => generateRoute(STUDENT_NAMESPACE, route)
export const generateAdminRoute = (route: string) => generateRoute(ADMIN_NAMESPACE, route)

export const isUserAdmin = (user: UserPublicMetadata | undefined) => {
  if (!user) {
    return false
  }
  return user.role === "ADMIN"
}