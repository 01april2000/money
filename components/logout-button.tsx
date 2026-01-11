"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="outline">
      {isLoading ? "Logging out..." : "Log Out"}
    </Button>
  )
}
