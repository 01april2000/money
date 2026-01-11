"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar, menuItems } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { DashboardContent } from "./dashboard-content"
import { User, Bell } from "lucide-react"

interface DashboardLayoutProps {
  children?: React.ReactNode
  dashboardData?: any
  session?: any
}

export function DashboardLayout({ children, dashboardData, session }: DashboardLayoutProps) {
  const [activeItem, setActiveItem] = React.useState("dashboard")
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["transaksi-pembayaran"])

  const handleItemSelect = (itemId: string) => {
    setActiveItem(itemId)
  }

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getActiveItemLabel = () => {
    for (const item of menuItems) {
      if (item.id === activeItem) return item.label
      if (item.children) {
        const child = item.children.find(c => c.id === activeItem)
        if (child) return `${item.label} - ${child.label}`
      }
    }
    return "Dashboard"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem={activeItem}
        onItemSelect={handleItemSelect}
        expandedItems={expandedItems}
        onToggleExpand={handleToggleExpand}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold">{getActiveItemLabel()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {(session?.user as any)?.role || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children || <DashboardContent activeItem={activeItem} dashboardData={dashboardData} />}
        </main>
      </div>
    </div>
  )
}
