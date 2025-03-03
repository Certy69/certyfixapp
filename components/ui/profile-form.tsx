"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ProfileForm() {
  const { toast } = useToast()
  const [notificationEmail, setNotificationEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Here you would typically send the data to your API
      // For now, we'll just simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Notification email updated:", notificationEmail)
      toast({
        title: "Profile Updated",
        description: "Your notification email has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update notification email. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
      <p className="text-sm text-muted-foreground mb-6">Update your notification email preferences.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notificationEmail">Notification Email</Label>
          <Input
            id="notificationEmail"
            type="email"
            placeholder="Enter notification email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            This email will receive notifications when suppliers don't update their certificates on time.
          </p>
        </div>
        <Button type="submit">Update Profile</Button>
      </form>
    </div>
  )
}

