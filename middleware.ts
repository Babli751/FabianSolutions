// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // List of supported locales
  const locales = ["en", "ru", "tr"];

  // Extract the first segment of the path
  const pathLocale = pathname.split("/")[1];

  // If there is no locale in the path, redirect to "/en"
  if (!locales.includes(pathLocale)) {
    return NextResponse.redirect(new URL(`/en${pathname}`, req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all requests
export const config = {
  matcher: "/:path*",
};
