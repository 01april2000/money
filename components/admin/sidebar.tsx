"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Users, 
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
    id: "user-management",
    label: "User Management",
    icon: <Users className="h-4 w-4" />
  },
  {
    id: "santri-management",
    label: "Management Santri",
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
      },
      {
        id: "uang-saku",
        label: "Uang Saku",
        icon: <DollarSign className="h-4 w-4" />
      },
      {
        id: "laundry",
        label: "Laundry",
        icon: <Shirt className="h-4 w-4" />
      }
    ]
  },
  {
    id: "keuangan",
    label: "Keuangan",
    icon: <BarChart3 className="h-4 w-4" />
  }
]

interface SidebarProps {
  activeItem: string
  onItemSelect: (itemId: string) => void
  expandedItems: string[]
  onToggleExpand: (itemId: string) => void
}

export function Sidebar({ activeItem, onItemSelect, expandedItems, onToggleExpand }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
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
            isExpanded={expandedItems.includes(item.id)}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <a href="/">
            <LogOut className="h-4 w-4" />
            Logout
          </a>
        </Button>
      </div>
    </aside>
  )
}

interface SidebarItemProps {
  item: MenuItem
  activeItem: string
  onItemSelect: (itemId: string) => void
  isExpanded: boolean
  onToggleExpand: (itemId: string) => void
}

function SidebarItem({ item, activeItem, onItemSelect, isExpanded, onToggleExpand }: SidebarItemProps) {
  const hasChildren = item.children && item.children.length > 0
  const isActive = activeItem === item.id || item.children?.some(child => child.id === activeItem)

  return (
    <div>
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
          isActive
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
        <div className="ml-4 mt-1 space-y-1">
          {item.children!.map((child) => (
            <button
              key={child.id}
              onClick={() => onItemSelect(child.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeItem === child.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {child.icon}
              <span>{child.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
