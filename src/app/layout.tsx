
'use client'

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import "./globals.css";
import { usePathname } from "next/navigation";
import { DataProvider } from "@/contexts/data-context";
import { Analytics } from "@vercel/analytics/next";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Life Architect</title>
        <meta name="description" content="Track habits and achieve your goals." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthGuard>
            <DataProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </DataProvider>
          </AuthGuard>
        </FirebaseClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

// We extract the main app layout to conditionally render it
// based on the authentication status or route.
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show the main layout on the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
