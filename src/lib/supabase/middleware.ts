import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database, UserRole } from "@/types/database";

function dashboardPath(role: UserRole) {
  switch (role) {
    case "freelancer":
      return "/freelancer";
    case "funeral_company":
      return "/funeral-company";
    case "admin":
      return "/admin";
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/select-role");
  const isProtected =
    pathname.startsWith("/freelancer") ||
    pathname.startsWith("/funeral-company") ||
    pathname.startsWith("/admin");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (isAuthPage || isProtected || pathname === "/")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role;

    if (user && isAuthPage && role) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath(role);
      return NextResponse.redirect(url);
    }

    if (role === "freelancer" && pathname.startsWith("/funeral-company")) {
      const url = request.nextUrl.clone();
      url.pathname = "/freelancer";
      return NextResponse.redirect(url);
    }
    if (role === "funeral_company" && pathname.startsWith("/freelancer")) {
      const url = request.nextUrl.clone();
      url.pathname = "/funeral-company";
      return NextResponse.redirect(url);
    }
    if (role !== "admin" && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = role ? dashboardPath(role) : "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
