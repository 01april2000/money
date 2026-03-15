"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  UserCheck,
  Wallet,
  FileText,
  Receipt,
  DollarSign,
  Shirt,
  BarChart3,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type MenuItem = {
  id: string
  label: string
  icon: React.ReactNode
  children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    id: "santri-management",
    label: "Data Santri SMK",
    icon: <UserCheck className="h-4 w-4" />
  },
  {
    id: "transaksi-pembayaran",
    label: "Transaksi Pembayaran",
    icon: <Wallet className="h-4 w-4" />,
    children: [
      {
        id: "spp",
        label: "SPP",
        icon: <FileText className="h-4 w-4" />
      },
      {
        id: "syahriah",
        label: "Syahriah",
        icon: <Receipt className="h-4 w-4" />
      }
    ]
  },
  {
    id: "keuangan",
    label: "Laporan Keuangan",
    icon: <BarChart3 className="h-4 w-4" />
  }
]

interface SidebarProps {
  activeItem: string
  onItemSelect: (itemId: string) => void
  expandedItems: string[]
  onToggleExpand: (itemId: string) => void
}

function SidebarItem({
  item,
  activeItem,
  onItemSelect,
  expandedItems,
  onToggleExpand,
  level = 0
}: {
  item: MenuItem
  activeItem: string
  onItemSelect: (itemId: string) => void
  expandedItems: string[]
  onToggleExpand: (itemId: string) => void
  level?: number
}) {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedItems.includes(item.id)
  const isActive = activeItem === item.id
  const hasActiveChild = item.children?.some(child => child.id === activeItem)

  return (
    <div className={cn(level > 0 && "ml-4")}>
      <button
        onClick={() => {
          if (hasChildren) {
            onToggleExpand(item.id)
          } else {
            onItemSelect(item.id)
          }
        }}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive || hasActiveChild
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {hasChildren && (
          isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        )}
      </button>
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              activeItem={activeItem}
              onItemSelect={onItemSelect}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ activeItem, onItemSelect, expandedItems, onToggleExpand }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Bendahara SMK</h1>
        <p className="text-sm text-muted-foreground">Money Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            activeItem={activeItem}
            onItemSelect={onItemSelect}
            expandedItems={expandedItems}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          © 2024 Money Management
        </div>
      </div>
    </aside>
  )
}
