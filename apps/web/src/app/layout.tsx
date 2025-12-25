import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Explain My Game",
  description:
    "Turn basketball game stats into clear coaching insights using AI",
  keywords: ["basketball", "coaching", "analytics", "AI", "sports"],
};

// Check if Clerk is configured
const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function RootContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // If Clerk is configured, wrap with ClerkProvider
  if (clerkConfigured) {
    return (
      <ClerkProvider>
        <RootContent>{children}</RootContent>
      </ClerkProvider>
    );
  }

  // For development without Clerk, just render children
  return <RootContent>{children}</RootContent>;
}
