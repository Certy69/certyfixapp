'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Supplier, Certificate } from '@/lib/db-helpers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'

export default function EditSupplierPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [supplierData, setSupplierData] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await fetch(`/api/suppliers/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSupplierData(data)
        } else {
          throw new Error('Failed to fetch supplier')
        }
      } catch (error) {
        console.error('Error fetching supplier:', error)
        setError('Failed to load supplier details. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupplier()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSupplierData(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierData) return

    try {
      const response = await fetch(`/api/suppliers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData),
      })

      if (response.ok) {
        router.push(`/dashboard/suppliers/${params.id}`)
      } else {
        throw new Error('Failed to update supplier')
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      setError('Failed to update supplier. Please try again.')
    }
  }

  const handleAddCertificate = async (certificate: Omit<Certificate, 'id'>) => {
    try {
      const response = await fetch(`/api/suppliers/${params.id}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certificate),
      })
      if (response.ok) {
        const updatedSupplier = await response.json()
        setSupplierData(updatedSupplier)
      } else {
        throw new Error('Failed to add certificate')
      }
    } catch (error) {
      console.error('Error adding certificate:', error)
      setError('Failed to add certificate. Please try again.')
    }
  }

  const handleUpdateCertificate = async (certificateId: string, updatedCertificate: Omit<Certificate, 'id'>) => {
    try {
      const response = await fetch(`/api/suppliers/${params.id}/certificates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId, ...updatedCertificate }),
      })
      if (response.ok) {
        const updatedSupplier = await response.json()
        setSupplierData(updatedSupplier)
      } else {
        throw new Error('Failed to update certificate')
      }
    } catch (error) {
      console.error('Error updating certificate:', error)
      setError('Failed to update certificate. Please try again.')
    }
  }

  const handleDeleteCertificate = async (certificateId: string) => {
    if (confirm('Are you sure you want to delete this certificate?')) {
      try {
        const response = await fetch(`/api/suppliers/${params.id}/certificates`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certificateId }),
        })
        if (response.ok) {
          const updatedSupplier = await response.json()
          setSupplierData(updatedSupplier)
        } else {
          throw new Error('Failed to delete certificate')
        }
      } catch (error) {
        console.error('Error deleting certificate:', error)
        setError('Failed to delete certificate. Please try again.')
      }
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!supplierData) {
    return <div>Supplier not found</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Edit Supplier</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                name="name"
                value={supplierData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={supplierData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={supplierData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={supplierData.address}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Certificates</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Certificate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Certificate</DialogTitle>
                  </DialogHeader>
                  <CertificateForm onSubmit={handleAddCertificate} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {supplierData.certificates && supplierData.certificates.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {supplierData.certificates.map((cert) => (
                  <li key={cert.id} className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cert.type}</p>
                        <p className="text-sm text-gray-500">
                          Issued: {format(new Date(cert.issueDate), 'PP')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires: {format(new Date(cert.expirationDate), 'PP')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Certificate</DialogTitle>
                            </DialogHeader>
                            <CertificateForm
                              initialData={cert}
                              onSubmit={(updatedCert) => handleUpdateCertificate(cert.id, updatedCert)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCertificate(cert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No certificates found for this supplier.</p>
            )}
          </CardContent>
        </Card>

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  )
}

interface CertificateFormProps {
  initialData?: Certificate
  onSubmit: (certificate: Omit<Certificate, 'id'>) => void
}

function CertificateForm({ initialData, onSubmit }: CertificateFormProps) {
  const [type, setType] = useState(initialData?.type || '')
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || '')
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      type,
      issueDate,
      expirationDate,
      status: 'valid', // You might want to calculate this based on the expiration date
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Certificate Type</Label>
        <Input
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="issueDate">Issue Date</Label>
        <Input
          id="issueDate"
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="expirationDate">Expiration Date</Label>
        <Input
          id="expirationDate"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          required
        />
      </div>
      <Button type="submit">{initialData ? 'Update' : 'Add'} Certificate</Button>
    </form>
  )
}

