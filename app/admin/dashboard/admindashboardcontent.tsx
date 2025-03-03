'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Users, UserCheck, UserX, RefreshCw, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'
import { User } from '@/lib/db-helpers'

export default function AdminDashboardContent() {
  const [clients, setClients] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchClients()
    }
  }, [status, session, router])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/clients')
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError('Failed to load clients. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalClients = clients.length
  const approvedClients = clients.filter(client => client.isApproved).length
  const pendingClients = totalClients - approvedClients

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-10">
        {/* Header Section */}
        <div className="relative mb-10 p-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome Back, Admin</h1>
            <p className="text-blue-100">Manage your clients and monitor system activity</p>
          </div>
          <div className="absolute bottom-0 right-0 p-8">
            <Users className="h-24 w-24 text-white/10" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="transform transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalClients}</div>
              <p className="text-xs text-gray-500 mt-1">Active accounts in the system</p>
            </CardContent>
          </Card>
          <Card className="transform transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Approved Clients</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{approvedClients}</div>
              <div className="text-xs text-gray-500 mt-1">
                {((approvedClients / totalClients) * 100 || 0).toFixed(1)}% of total clients
              </div>
            </CardContent>
          </Card>
          <Card className="transform transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <UserX className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{pendingClients}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="backdrop-blur-sm bg-white/50 shadow-lg border-0">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl text-gray-800">Manage Client Accounts</CardTitle>
                <CardDescription>View and manage all registered clients in the system</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={fetchClients} variant="outline" size="sm" className="hover:bg-gray-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="hover:bg-gray-100">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No clients found</p>
                <p className="text-sm">New clients will appear here once they register</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client._id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">{client.fullName}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.companyName}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            client.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.isApproved ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Approved
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="hover:bg-gray-100">
                            <Link href={`/admin/clients/${client._id}`}>
                              View Details
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

