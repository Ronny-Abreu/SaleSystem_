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
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  variable: '--font-inter',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: "SaleSystem - La Rubia",
  description: "Sistema de facturación moderno y eficiente",
  // Optimizaciones de rendimiento
  other: {
    'theme-color': '#f8fafc',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://salesystem-production-0d90.up.railway.app" />
            <link rel="dns-prefetch" href="https://salesystem-production-0d90.up.railway.app" />
          </>
        )}
        
        {/* CSS crítico inline para evitar bloqueo de renderizado */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* CSS crítico para renderizado inicial */
              html { 
                background-color: #f8fafc;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              }
              body { 
                margin: 0; 
                padding: 0; 
                background-color: #f8fafc;
                min-height: 100vh;
                color: #171717;
              }
              /* Prevenir FOUC sin bloquear renderizado */
              body:not(.loaded) {
                opacity: 0;
                transition: opacity 0.1s ease-in;
              }
              body.loaded {
                opacity: 1;
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${inter.variable}`} suppressHydrationWarning>
        <PreventFOUC />
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Marcar body como cargado inmediatamente para evitar FOUC
                if (document.body) {
                  document.body.classList.add('loaded');
                } else {
                  document.addEventListener('DOMContentLoaded', function() {
                    document.body.classList.add('loaded');
                  }, { once: true });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
