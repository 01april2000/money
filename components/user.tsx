"use client"

import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/components/logout-button"

export function User() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading user data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!session?.user) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <p className="text-muted-foreground">No user session found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>View your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p className="text-base">{session.user.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-base">{session.user.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Role</p>
          <p className="text-base">{(session.user as any).role || "N/A"}</p>
        </div>
        <div className="pt-4">
          <LogoutButton />
        </div>
      </CardContent>
    </Card>
  )
}
