'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Building2, Globe, Mail, Phone, User } from 'lucide-react'
import Image from 'next/image'

interface UserProfile {
  fullName: string
  email: string
  companyName: string
  companyLogo?: string
  companyAddress: string
  companyPhone: string
  companyWebsite: string
  contactPerson: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/profile')
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to fetch profile')
          }
          const data = await response.json()
          setProfile(data)
          setError(null)
        } catch (error) {
          console.error('Error fetching profile:', error)
          setError(error instanceof Error ? error.message : 'An unknown error occurred')
          toast({
            title: "Error",
            description: "Failed to load profile data. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    fetchProfile()
  }, [status, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    const formData = new FormData()
    Object.entries(profile).forEach(([key, value]) => {
      formData.append(key, value)
    })
    if (logoFile) {
      formData.append('companyLogo', logoFile)
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
      setLogoFile(null)
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <div className="p-4 text-center text-red-500">Access Denied. Please log in.</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="w-full">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
              <p className="font-semibold">Error: {error}</p>
              <p className="text-sm mt-1">Please try refreshing the page. If the issue persists, contact support.</p>
            </div>
          ) : profile ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Logo Section */}
                <div className="md:col-span-2">
                  <Label htmlFor="companyLogo" className="text-lg font-semibold block mb-4">
                    Company Logo
                  </Label>
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    {profile.companyLogo && (
                      <div className="mb-4">
                        <Image
                          src={profile.companyLogo || "/placeholder.svg"}
                          alt="Company Logo"
                          width={200}
                          height={200}
                          className="rounded-lg object-contain"
                        />
                      </div>
                    )}
                    {isEditing && (
                      <div className="w-full max-w-md">
                        <Input
                          id="companyLogo"
                          name="companyLogo"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Recommended: Square image, at least 200x200 pixels
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyAddress" className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Address
                    </Label>
                    <Input
                      id="companyAddress"
                      name="companyAddress"
                      value={profile.companyAddress}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Company Phone
                    </Label>
                    <Input
                      id="companyPhone"
                      name="companyPhone"
                      value={profile.companyPhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyWebsite" className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Company Website
                    </Label>
                    <Input
                      id="companyWebsite"
                      name="companyWebsite"
                      value={profile.companyWebsite}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Person
                    </Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={profile.contactPerson}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={profile.email}
                      disabled={true}
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                {isEditing ? (
                  <>
                    <Button type="submit" size="lg">
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    size="lg"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

