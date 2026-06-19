import { NextResponse, type NextRequest } from "next/server"

// ponytail: gate on presence of the httpOnly refresh cookie (7d, only set after
// a successful admin login). Token validity + refresh-on-401 is handled where we
// actually call the backend — add that helper when the dashboard fetches data.
// Cookie name mirrors REFRESH_COOKIE in lib/session.ts.
const REFRESH_COOKIE = "bg_refresh"

export function proxy(req: NextRequest) {
  const authed = req.cookies.has(REFRESH_COOKIE)
  const isLogin = req.nextUrl.pathname === "/login"

  if (!authed && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
