import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*', '/sign-up*']

const isPublic = (path: string) => {
  return publicPaths.find(x =>
    path.match(new RegExp(`^${x}$`.replace('*$', '($|/)')))
  )
}

export default withClerkMiddleware((request: NextRequest) => {
  // if the user is not signed in redirect them to the sign in page.
  const { userId } = getAuth(request)
  const isRoutePublic = isPublic(request.nextUrl.pathname)

  if (!userId && !isRoutePublic) {
    const signInUrl = new URL('/', request.url)
    return NextResponse.redirect(signInUrl)
  } else if (isRoutePublic && userId) {
    const coursesUrl = new URL('/courses', request.url)
    return NextResponse.redirect(coursesUrl)
  }
  return NextResponse.next()
})

export const config = { matcher:  '/((?!_next/image|_next/static|favicon.ico).*)'};