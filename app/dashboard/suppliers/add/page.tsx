'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Upload, FileText } from 'lucide-react'
import { Certificate } from '@/lib/db-helpers'

export default function AddSupplierPage() {
  const router = useRouter()
  const [supplierData, setSupplierData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [certificates, setCertificates] = useState<(Partial<Certificate> & { file?: File })[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSupplierData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddCertificate = () => {
    setCertificates(prev => [...prev, { type: '', issueDate: '', expirationDate: '' }])
  }

  const handleRemoveCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index))
  }

  const handleCertificateChange = (index: number, field: keyof Certificate, value: string) => {
    setCertificates(prev => 
      prev.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    )
  }

  const handleFileUpload = (index: number, file: File | null) => {
    setCertificates(prev =>
      prev.map((cert, i) =>
        i === index ? { ...cert, file: file || undefined } : cert
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const formData = new FormData()
      formData.append('supplierData', JSON.stringify(supplierData))

      certificates.forEach((cert, index) => {
        formData.append(`certificate${index}`, JSON.stringify({
          type: cert.type,
          issueDate: cert.issueDate,
          expirationDate: cert.expirationDate
        }))
        if (cert.file) {
          formData.append(`certificateFile${index}`, cert.file)
        }
      })

      const response = await fetch('/api/suppliers', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to add supplier')
      }

      router.push('/dashboard/suppliers')
    } catch (error) {
      console.error('Error adding supplier:', error)
      setError('Failed to add supplier. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={supplierData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={supplierData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={supplierData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Certificates (Optional)</Label>
              {certificates.map((cert, index) => (
                <div key={index} className="flex space-x-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Certificate Type"
                      value={cert.type}
                      onChange={(e) => handleCertificateChange(index, 'type', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="date"
                      placeholder="Issue Date"
                      value={cert.issueDate}
                      onChange={(e) => handleCertificateChange(index, 'issueDate', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="date"
                      placeholder="Expiration Date"
                      value={cert.expirationDate}
                      onChange={(e) => handleCertificateChange(index, 'expirationDate', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(index, e.target.files ? e.target.files[0] : null)}
                    />
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveCertificate(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddCertificate}>
                <Plus className="h-4 w-4 mr-2" /> Add Certificate
              </Button>
            </div>

            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit">Add Supplier</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

