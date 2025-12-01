import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/Sidebar";
import TopActionsBar from "@/components/TopActionsBar";
import { requireUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "EcoGo",
  description: "Fully Functional Admin Dashboard for EcoGo",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user for sidebar permissions
  const user = await requireUser().catch(() => null);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen bg-gray-50">
            {/* ✅ Sidebar always visible when user exists */}
            {user && (
              <Sidebar
                userPermissions={user.permissions || {}}
                userName={user.firstName || user.email}
              />
            )}

            {/* Right side */}
            <main className="flex-1 overflow-y-auto relative">
              {user && <TopActionsBar />} {/* Top bar stays consistent */}
              {children} {/* All pages render here, including 404 */}
            </main>
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
