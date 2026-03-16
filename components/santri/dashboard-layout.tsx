"use client"

import * as React from "react"
import { Sidebar, menuItems } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, Bell, Menu } from "lucide-react"
import { useSession } from "@/lib/auth-client"

interface DashboardLayoutProps {
  children?: React.ReactNode
  activeItem?: string
}

export function DashboardLayout({ children, activeItem = "dashboard" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { data: session } = useSession()

  const getActiveItemLabel = () => {
    const item = menuItems.find(i => i.id === activeItem)
    return item?.label || "Dashboard"
  }

  const handleItemSelect = (itemId: string) => {
    // Navigate to the selected item's path
    const item = menuItems.find(i => i.id === itemId)
    if (item) {
      window.location.href = item.path
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem={activeItem}
        onItemSelect={handleItemSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold">{getActiveItemLabel()}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <ThemeToggle />
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-border">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{session?.user?.name || "Santri"}</p>
                <p className="text-xs text-muted-foreground">
                  {(session?.user as any)?.role || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
