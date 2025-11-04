import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { PreventFOUC } from "@/components/ui/prevent-fouc"

const inter = Inter({ 
  subsets: ["latin"], 
  display: "swap", 
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: "SaleSystem - La Rubia",
  description: "Sistema de facturación moderno y eficiente",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" ? (
          <>
            <link rel="preconnect" href="https://salesystem-production-0d90.up.railway.app" />
            <link rel="dns-prefetch" href="https://salesystem-production-0d90.up.railway.app" />
          </>
        ) : null}
        
        {process.env.NODE_ENV === "production" && (
          <link rel="prefetch" href="/api/productos.php" as="fetch" crossOrigin="use-credentials" />
        )}
        
        {process.env.NODE_ENV === "production" && (
          <>
            <link rel="dns-prefetch" href="https://vercel.live" />
            <link rel="preconnect" href="https://vercel.live" crossOrigin="anonymous" />
          </>
        )}
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Versión optimizada sin setTimeout que causa retrasos
                const showContent = () => {
                  document.documentElement.classList.add('loaded');
                };
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', showContent, { once: true });
                } else {
                  showContent();
                }
              })();
            `,
          }}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { 
                visibility: hidden; 
                background-color: #f8fafc;
              }
              html.loaded { 
                visibility: visible; 
              }
              body { 
                margin: 0; 
                padding: 0; 
                background-color: #f8fafc;
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PreventFOUC />
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
