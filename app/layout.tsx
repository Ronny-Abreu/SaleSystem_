import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { PreventFOUC } from "@/components/ui/prevent-fouc"

const inter = Inter({ subsets: ["latin"], display: "swap", preload: true })

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Ocultar contenido hasta que los estilos estén listos
                if (!document.documentElement.classList.contains('loaded')) {
                  document.documentElement.style.visibility = 'hidden';
                  document.documentElement.style.opacity = '0';
                }
                
                // Mostrar cuando la página esté completamente cargada
                function showContent() {
                  document.documentElement.classList.add('loaded');
                  document.documentElement.style.visibility = 'visible';
                  document.documentElement.style.opacity = '1';
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', showContent);
                } else {
                  showContent();
                }
                
                // Fallback: mostrar después de un tiempo máximo
                setTimeout(showContent, 100);
              })();
            `,
          }}
        />
        {/* Estilos críticos inline para prevenir FOUC */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { 
                visibility: hidden; 
                opacity: 0; 
                background-color: #f8fafc;
              }
              html.loaded { 
                visibility: visible; 
                opacity: 1; 
                transition: opacity 0.15s ease-in; 
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
