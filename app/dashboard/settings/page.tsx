import type { Metadata } from "next"
import { NotificationSettings } from "@/components/notification-settings"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/ui/profile-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and notification preferences.",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your account settings and configure notification preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

