import { withClerkMiddleware, getAuth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateAdminRoute, generateStudentRoute, isUserAdmin } from './lib/auth'

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*', '/sign-up*']

const studentPaths = [generateStudentRoute("*")]
const adminPaths = [generateAdminRoute("*")]

const isPublic = (path: string) => {
  return publicPaths.find(x =>
    path.match(new RegExp(`^${x}$`.replace('*$', '($|/)')))
  )
}

const isAdmin = (path: string) => {
  return path.startsWith(generateAdminRoute(""))
}

const isStudent = (path: string) => {
  return path.startsWith(generateStudentRoute(""))
}

export default withClerkMiddleware(async (request: NextRequest) => {
  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request)
  const user = userId ? await clerkClient.users.getUser(userId) : null;

  // route checks
  const isRoutePublic = isPublic(request.nextUrl.pathname)
  const isRouteAdmin = isAdmin(request.nextUrl.pathname)
  const isRouteStudent = isStudent(request.nextUrl.pathname)

  // setup redirect urls
  const coursesUrl = new URL(generateStudentRoute("courses"), request.url)
  const adminUrl = new URL(generateAdminRoute("overview"), request.url)
  const signInUrl = new URL('/', request.url)

  if (!userId && !isRoutePublic) {
    // if they are trying to access a private route while not logged in
    return NextResponse.redirect(signInUrl)
  } else if (isRoutePublic && userId) {
    // if they are trying to access a public route while logged in
    return NextResponse.redirect(user && isUserAdmin(user.publicMetadata) ? adminUrl : coursesUrl)
  } else if (user && isRouteStudent && isUserAdmin(user.publicMetadata)) {
    // if they are a admin trying to access a student route
    return NextResponse.redirect(adminUrl)
  } else if (user && isRouteAdmin && !isUserAdmin(user.publicMetadata)) {
    // if they are a student trying to access an admin route
    return NextResponse.redirect(coursesUrl)
  }

  return NextResponse.next()
})

export const config = { matcher:  '/((?!_next/image|_next/static|favicon.ico).*)'};