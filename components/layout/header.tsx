"use client"

import { Search } from "lucide-react"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showHomeAcess?: boolean;
}

export function Header({ title, subtitle, showHomeAcess }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="ml-12 lg:ml-0">
          {title && <h1 className="text-2xl font-bold text-slate-900">{title}</h1>}
          {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
        </div>

        {showHomeAcess ? (
          <a href="/" className="py-1 px-2 bg-amber-200 hover:bg-amber-100 text-black rounded-2xl">Volver al inicio</a>
        ) : (
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <NotificationDropdown />
          </div>
        )}
      </div>
    </header>
  );
}