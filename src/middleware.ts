import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

export default async function middleware(req: Request & { nextUrl: URL }) {
  const { nextUrl } = req;
  const token = await getToken({ req: req as never, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

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
}

export const config = {
  matcher: ["/admin/:path*", "/minha-conta/:path*", "/checkout/:path*"],
};
