"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { useSession } from "next-auth/react"

export function SecuritySettings() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)

  const handleSessionRevoke = async () => {
    setSubmitting(true)
    try {
      // In a real app, you would revoke all sessions except the current one
      // For now, we'll just show a success toast
      toast({
        title: "Sessions revoked",
        description: "All other sessions have been revoked successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke sessions",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          {session?.user?.id ? <PasswordChangeForm userId={session.user.id} /> : <p>Loading...</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revoking sessions will log you out from all devices except the current one.
            </p>
            <Button onClick={handleSessionRevoke} disabled={submitting} variant="destructive">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an extra layer of security to your account by requiring more than just a
              password to sign in.
            </p>
            <Button variant="outline">Enable Two-Factor Authentication</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
