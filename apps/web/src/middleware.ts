import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Check if Clerk is properly configured with actual keys at build time
const hasClerkKeys = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY.startsWith("sk_")
);

export function middleware(request: NextRequest) {
  // In development mode (without Clerk keys), allow all routes
  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  // If Clerk is configured, we would use Clerk middleware here
  // For now, just pass through - Clerk components will handle auth UI
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
