import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isSafeNextPath(path: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

export async function updateSession(request: NextRequest) {
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
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Refresh the auth token. Do not insert logic between createServerClient
  // and getClaims — it can cause intermittent logouts.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  const isAuthenticated = Boolean(userId);

  const path = request.nextUrl.pathname;
  const protectedPrefixes = [
    "/home",
    "/settings",
    "/speak",
    "/session",
    "/prompt",
    "/topics",
    "/my-voice",
    "/express",
    "/stand",
    "/connect",
    "/explore",
    "/practice",
    "/journey",
    "/orbits",
    "/onboarding",
    "/age-verification",
    "/auth/update-password",
    "/professional/home",
    "/professional/recommend",
  ];
  const isProtected = protectedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (!isAuthenticated && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = path.startsWith("/professional")
      ? "/login/professional"
      : "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/login/professional",
    "/signup/professional",
  ];
  if (isAuthenticated && authPages.includes(path)) {
    const next = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    url.pathname = isSafeNextPath(next) ? next : "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // One-time username setup before entering the normal app.
  if (isAuthenticated && userId && isProtected) {
    const usernameExempt =
      path === "/onboarding/username" ||
      path.startsWith("/age-verification") ||
      path.startsWith("/auth/");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username_normalized")
      .eq("id", userId)
      .maybeSingle();

    // If profiles aren't migrated yet, don't block the rest of Haelo.
    if (!profileError) {
      const mustChooseUsername =
        !profile?.username_normalized;

      if (mustChooseUsername && !usernameExempt) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding/username";
        url.search = "";
        return NextResponse.redirect(url);
      }

      if (!mustChooseUsername && path === "/onboarding/username") {
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
