'use client'

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "@/components/auth/auth-guard";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

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
        {isLoginPage ? (
          children
        ) : (
          <SidebarProvider>
            <SidebarNav />
            <SidebarInset>
              <Header />
              <main className="p-4 sm:p-6 lg:p-8">
                <AuthGuard>{children}</AuthGuard>
              </main>
            </SidebarInset>
          </SidebarProvider>
        )}
        <Toaster />
      </body>
    </html>
  );
}
