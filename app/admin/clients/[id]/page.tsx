'use client'

import { useState, useEffect, use } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, UserCheck, UserX, Trash2, Mail, Building, Calendar, AlertTriangle, CheckCircle2, LogOut } from 'lucide-react'
import { User } from '@/lib/db-helpers'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [client, setClient] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchClientDetails()
    }
  }, [status, session, router, resolvedParams.id])

  const fetchClientDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/clients/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch client details')
      }
      const data = await response.json()
      setClient(data.client)
    } catch (error) {
      console.error('Error fetching client details:', error)
      setError('Failed to load client details. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovalChange = async () => {
    if (!client) return

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: client._id, isApproved: !client.isApproved }),
      })
      if (response.ok) {
        setClient(prevClient => prevClient ? { ...prevClient, isApproved: !prevClient.isApproved } : null)
      } else {
        throw new Error('Failed to update client approval status')
      }
    } catch (error) {
      console.error('Error updating client approval status:', error)
      setError('Failed to update approval status. Please try again.')
    }
  }

  const handleDeleteClient = async () => {
    if (!client) return

    try {
      const response = await fetch(`/api/admin/clients/${client._id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        throw new Error('Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      setError('Failed to delete client. Please try again.')
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !client) {
    return <div className="text-red-500">{error || 'Client not found'}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Client Details</h1>
            <p className="text-gray-500 mt-1">View and manage client information</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/dashboard')} className="hover:bg-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="md:col-span-2 backdrop-blur-sm bg-white/50">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{client.fullName}</CardTitle>
                  <CardDescription>Client Profile Information</CardDescription>
                </div>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  client.isApproved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {client.isApproved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approved Account
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Pending Approval
                    </>
                  )}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div className="flex items-center p-4 bg-gray-50/50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-900">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50/50 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-gray-900">{client.companyName}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Date</p>
                    <p className="text-gray-900">{new Date(client.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage client account</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button 
                  onClick={handleApprovalChange} 
                  className="w-full"
                  variant={client.isApproved ? "outline" : "default"}
                >
                  {client.isApproved ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" /> Revoke Approval
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" /> Approve Client
                    </>
                  )}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the client
                        account and remove all associated data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" onClick={handleDeleteClient}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  onClick={handleLogout} 
                  className="w-full"
                  variant="outline"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

