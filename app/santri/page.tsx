"use client"

import { useEffect } from "react"
import { DashboardLayout } from "@/components/santri/dashboard-layout"
import { DashboardContent } from "@/components/santri/dashboard-content"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export default function SantriDashboardPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Get santriId from session user
  const santriId = (session.user as any)?.santriId

  return (
    <DashboardLayout activeItem="dashboard">
      <DashboardContent santriId={santriId} />
    </DashboardLayout>
  )
}
