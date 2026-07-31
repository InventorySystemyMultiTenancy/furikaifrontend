import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAccountRoute = nextUrl.pathname.startsWith("/minha-conta");
  const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout") && nextUrl.pathname !== "/checkout/sucesso" && nextUrl.pathname !== "/checkout/erro" && nextUrl.pathname !== "/checkout/pendente";

  if (isAdminRoute) {
    if (!isLoggedIn || !role || !ADMIN_ROLES.has(role)) {
      const loginUrl = new URL("/entrar", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if ((isAccountRoute || isCheckoutRoute) && !isLoggedIn) {
    const loginUrl = new URL("/entrar", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/minha-conta/:path*", "/checkout/:path*"],
};
