"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Home, Wallet, Shirt, Calendar, LogOut, User, Menu, X } from "lucide-react"

export interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

export const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" />, path: "/santri" },
  { id: "spp", label: "SPP", icon: <Calendar className="h-5 w-5" />, path: "/santri/spp" },
  { id: "uang-saku", label: "Uang Saku", icon: <Wallet className="h-5 w-5" />, path: "/santri/uang-saku" },
  { id: "laundry", label: "Laundry", icon: <Shirt className="h-5 w-5" />, path: "/santri/laundry" },
  { id: "syahriah", label: "Syahriah", icon: <Calendar className="h-5 w-5" />, path: "/santri/syahriah" },
  { id: "profil", label: "Profil", icon: <User className="h-5 w-5" />, path: "/santri/profil" },
]

interface SidebarProps {
  activeItem: string
  onItemSelect: (itemId: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ activeItem, onItemSelect, isOpen = true, onClose }: SidebarProps) {
  const handleItemClick = (itemId: string) => {
    onItemSelect(itemId)
    onClose?.()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">SantriApp</span>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-2 rounded-lg hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activeItem === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => window.location.href = "/auth"}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
