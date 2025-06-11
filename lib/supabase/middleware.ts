import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to dashboard after successful auth
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Refresh session if expired - required for Server Components  
  const { data: { user }, error } = await supabase.auth.getUser()

  // Prevent redirect loops by checking for redirect parameters
  const isRedirectLoop = request.nextUrl.searchParams.has("redirectedFrom")
  
  // If the request is for the dashboard, check for a valid user
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check if user authentication failed or user doesn't exist
    if (error || !user) {
      console.log("Dashboard access denied - redirecting to login", { error: error?.message, userExists: !!user })
      // If we're already in a redirect loop, break it
      if (isRedirectLoop) {
        console.log("Redirect loop detected - clearing auth and redirecting to home")
        const response = NextResponse.redirect(new URL("/", request.url))
        // Clear auth cookies to ensure clean state
        response.cookies.delete("sb-access-token")
        response.cookies.delete("sb-refresh-token")
        return response
      }
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    console.log("Dashboard access granted for user:", user.id)
  }

  // If the request is for login page and user is authenticated, redirect to dashboard
  if (request.nextUrl.pathname === "/auth/login") {
    if (!error && user) {
      console.log("User authenticated on login page - redirecting to dashboard:", user.id)
      // Prevent redirect loops
      if (isRedirectLoop) {
        console.log("Redirect loop detected on login page - allowing access")
        return supabaseResponse
      }
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    console.log("User not authenticated on login page - allowing access")
  }

  return supabaseResponse
}
