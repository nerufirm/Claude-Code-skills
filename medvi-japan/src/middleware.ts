import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update cookies on the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Create a fresh response that carries the updated request
          supabaseResponse = NextResponse.next({
            request,
          });
          // Set cookies on the response (for the browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth session so it stays alive.
  // IMPORTANT: Do NOT use destructuring like const { data: { session } } here.
  // getUser() sends a request to Supabase Auth to validate the token,
  // which also refreshes expired tokens and updates the cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow webhook endpoints without authentication (Stripe, LINE, etc.)
  if (pathname.startsWith("/api/webhooks")) {
    return supabaseResponse;
  }

  // Protect /dashboard/* routes - redirect unauthenticated users to /login
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Allow auth-related API endpoints without authentication
  if (pathname.startsWith("/api/auth/")) {
    return supabaseResponse;
  }

  // Protect /api/* routes - return 401 for unauthenticated requests
  if (pathname.startsWith("/api/") && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder assets (images, svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
