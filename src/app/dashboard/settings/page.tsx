import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"
import { FeatureFlagsManager } from "@/components/dashboard/FeatureFlagsManager"
import { OTPSettings } from "@/components/dashboard/OTPSettings"

export const metadata: Metadata = {
  title: "Settings | Dashboard | SeeMyCampus",
  description: "Admin settings and configuration",
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage application settings and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic application settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Site Name</label>
                <p className="text-sm text-muted-foreground">SeeMyCampus</p>
              </div>
              <div>
                <label className="text-sm font-medium">Site URL</label>
                <p className="text-sm text-muted-foreground">https://seemycampus.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage admin users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current User</label>
                <p className="text-sm text-muted-foreground">
                  {session.user?.name || session.user?.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <p className="text-sm text-muted-foreground">Administrator</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
            <CardDescription>Database configuration and management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Database Type</label>
                <p className="text-sm text-muted-foreground">PostgreSQL</p>
              </div>
              <div>
                <label className="text-sm font-medium">ORM</label>
                <p className="text-sm text-muted-foreground">Drizzle ORM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Platform and version details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Framework</label>
                <p className="text-sm text-muted-foreground">Next.js 16.1.0</p>
              </div>
              <div>
                <label className="text-sm font-medium">Node Version</label>
                <p className="text-sm text-muted-foreground">18+</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags Section */}
      <div className="mt-8">
        <FeatureFlagsManager />
      </div>

      {/* OTP Settings Section */}
      <div className="mt-8">
        <OTPSettings />
      </div>
    </div>
  )
}

