"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Supplier, Certificate } from "@/lib/db-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { CertificateList } from "@/components/certificate-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PageParams {
  id: string
}

interface PageProps {
  params: PageParams
}

const SupplierPage: React.FC<PageProps> = ({ params }) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [editedSupplier, setEditedSupplier] = useState<Partial<Supplier>>({})
  const [newCertificate, setNewCertificate] = useState<Partial<Certificate>>({
    type: "",
    issueDate: "",
    expirationDate: new Date().toISOString().split("T")[0],
  })
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchSupplier = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/suppliers/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSupplier(data)
          setEditedSupplier(data)
        } else {
          throw new Error("Failed to fetch supplier data")
        }
      } catch (error) {
        console.error("Error fetching supplier:", error)
        toast({
          title: "Error",
          description: "Failed to load supplier data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchSupplier()
  }, [params.id, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedSupplier((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setEditedSupplier((prev) => ({ ...prev, type: value as Supplier["type"] }))
  }

  const handleSaveSupplier = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/suppliers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedSupplier),
      })

      if (response.ok) {
        const updatedSupplier = await response.json()
        setSupplier(updatedSupplier)
        toast({
          title: "Supplier Updated",
          description: "The supplier details have been successfully updated.",
        })
      } else {
        throw new Error("Failed to update supplier")
      }
    } catch (error) {
      console.error("Error updating supplier:", error)
      toast({
        title: "Error",
        description: "Failed to update the supplier. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplier || !session?.user?.customerId) return

    const formData = new FormData()
    formData.append("type", newCertificate.type || "")
    formData.append("issueDate", newCertificate.issueDate || "")
    formData.append("expirationDate", newCertificate.expirationDate || "")
    if (file) {
      formData.append("file", file)
    }

    try {
      const response = await fetch(`/api/suppliers/${supplier._id}/certificates`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const updatedSupplier = await response.json()
        setSupplier(updatedSupplier)
        setNewCertificate({ type: "", issueDate: "", expirationDate: new Date().toISOString().split("T")[0] })
        setFile(null)
        toast({
          title: "Certificate added",
          description: "The certificate has been successfully added.",
        })
      } else {
        throw new Error("Failed to add certificate")
      }
    } catch (error) {
      console.error("Error adding certificate:", error)
      toast({
        title: "Error",
        description: "Failed to add the certificate. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCertificate = async (
    certificateId: string,
    updatedCertificate: Partial<Omit<Certificate, "id">>,
  ) => {
    if (!supplier) return

    try {
      const response = await fetch(`/api/suppliers/${supplier._id}/certificates/${certificateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCertificate),
      })

      if (response.ok) {
        const updatedSupplier = await response.json()
        setSupplier(updatedSupplier)
        toast({
          title: "Certificate updated",
          description: "The certificate has been successfully updated.",
        })
      } else {
        throw new Error("Failed to update certificate")
      }
    } catch (error) {
      console.error("Error updating certificate:", error)
      toast({
        title: "Error",
        description: "Failed to update the certificate. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCertificate = async (certificateId: string) => {
    if (!supplier) return

    try {
      const response = await fetch(`/api/suppliers/${supplier._id}/certificates/${certificateId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedSupplier = await response.json()
        setSupplier(updatedSupplier)
        toast({
          title: "Certificate deleted",
          description: "The certificate has been successfully deleted.",
        })
      } else {
        throw new Error("Failed to delete certificate")
      }
    } catch (error) {
      console.error("Error deleting certificate:", error)
      toast({
        title: "Error",
        description: "Failed to delete the certificate. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Supplier not found</p>
      </div>
    )
  }

  const certificatesWithUploadInfo: CertificateWithUploadInfo[] =
    supplier.certificates?.map((cert) => ({
      ...cert,
      expirationDate: cert.expirationDate,
      uploadDate: new Date().toISOString(),
      fileUrl: cert.fileId ? `/api/certificates/${cert.fileId}` : "",
    })) || []

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/suppliers")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Suppliers</span>
        </Button>
        <h1 className="text-2xl font-bold">{supplier.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Supplier Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={editedSupplier.name || ""} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editedSupplier.email || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={editedSupplier.phone || ""} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={editedSupplier.type || ""} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="trader">Trader</SelectItem>
                  <SelectItem value="service">Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveSupplier} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificateList
            certificates={certificatesWithUploadInfo}
            onUpdateCertificate={handleUpdateCertificate}
            onDeleteCertificate={handleDeleteCertificate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCertificate} className="space-y-4">
            <div>
              <Label htmlFor="type">Certificate Type</Label>
              <Input
                id="type"
                value={newCertificate.type}
                onChange={(e) => setNewCertificate({ ...newCertificate, type: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={newCertificate.issueDate}
                onChange={(e) => setNewCertificate({ ...newCertificate, issueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                value={newCertificate.expirationDate || ""}
                onChange={(e) => setNewCertificate({ ...newCertificate, expirationDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="file">Certificate File (PDF)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <Button type="submit">Add Certificate</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

interface CertificateWithUploadInfo extends Omit<Certificate, "expirationDate"> {
  expirationDate: string
  uploadDate: string
  fileUrl: string
}

export default SupplierPage

