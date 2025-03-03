"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { FormItem, FormLabel, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const STANDARD_EMAIL_TEMPLATE = `Dear {{supplierName}},

This is a reminder that your {{certificateType}} is due to expire on {{expirationDate}}.

To ensure continued compliance and avoid any disruptions, please update your certificate as soon as possible using the secure link below:

{{magicLink}}

If you have already renewed your certificate, please use the link above to upload the new documentation.

Best regards,
Your Certyfix Team`

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstReminderDays: "30",
    secondReminderDays: "15",
    thirdReminderDays: "5",
  })

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const previewEmail = () => {
    const sampleData = {
      supplierName: "ABC Manufacturing",
      certificateType: "ISO 9001 Certification",
      expirationDate: "December 31, 2024",
      magicLink: "https://certyfix.com/update/abc123",
    }

    return STANDARD_EMAIL_TEMPLATE.replace(
      /{{(\w+)}}/g,
      (match, key) => sampleData[key as keyof typeof sampleData] || match,
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      toast({
        title: "Settings Updated",
        description: "Your notification settings have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your notification settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Standardized Email Format</AlertTitle>
        <AlertDescription>
          We use a standardized email format to ensure consistent communication with suppliers. You can preview the
          template below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Schedule</CardTitle>
          <CardDescription>Configure when suppliers receive certificate expiration notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            <FormItem>
              <FormLabel>First Reminder</FormLabel>
              <Select
                name="firstReminderDays"
                value={formData.firstReminderDays}
                onValueChange={handleSelectChange("firstReminderDays")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 days</SelectItem>
                  <SelectItem value="25">25 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            <FormItem>
              <FormLabel>Second Reminder</FormLabel>
              <Select
                name="secondReminderDays"
                value={formData.secondReminderDays}
                onValueChange={handleSelectChange("secondReminderDays")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 days</SelectItem>
                  <SelectItem value="15">15 days</SelectItem>
                  <SelectItem value="20">20 days</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            <FormItem>
              <FormLabel>Final Reminder</FormLabel>
              <Select
                name="thirdReminderDays"
                value={formData.thirdReminderDays}
                onValueChange={handleSelectChange("thirdReminderDays")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                After the final reminder, a notification will also be sent to your registered email address.
              </FormDescription>
            </FormItem>
            <div className="flex items-center justify-between pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" type="button">
                    <Mail className="mr-2 h-4 w-4" />
                    Preview Email Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Standard Email Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Badge>Subject</Badge>
                      <span>Important: Certificate Expiration Reminder</span>
                    </div>
                    <div className="rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
                      {previewEmail()}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

