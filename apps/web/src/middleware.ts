import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Check if Clerk is configured
const clerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

// If Clerk is not configured, allow all routes
export default clerkConfigured
  ? authMiddleware({
      // Routes that can be accessed without authentication
      publicRoutes: ["/", "/sign-in", "/sign-up", "/privacy", "/terms"],
    })
  : function noAuthMiddleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
