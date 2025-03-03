"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface CertificateData {
  type: string
  expirationDate: string
}

interface SupplierData {
  name: string
  email: string
}

export default function UpdateCertificatePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [supplier, setSupplier] = useState<SupplierData | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const token = searchParams?.get("token")
    if (!token) {
      setError("Invalid or missing token")
      setLoading(false)
      return
    }

    fetch(`/api/validate-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setCertificate(data.certificate)
          setSupplier(data.supplier)
        }
      })
      .catch((err) => setError("Failed to validate token"))
      .finally(() => setLoading(false))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const token = searchParams?.get("token")

    if (!token) {
      setError("Invalid or missing token")
      setLoading(false)
      return
    }

    try {
      const fileInput = document.getElementById("file") as HTMLInputElement
      const file = fileInput.files?.[0]

      if (!file) {
        throw new Error("No file selected")
      }

      const fileBuffer = await file.arrayBuffer()
      const fileBase64 = btoa(new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""))

      const res = await fetch("/api/update-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          expirationDate: formData.get("expirationDate"),
          file: fileBase64,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update certificate")
      }

      toast({
        title: "Success",
        description: "Certificate updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update certificate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Certificate</h1>
      {supplier && (
        <div className="mb-4">
          <p>Supplier: {supplier.name}</p>
          <p>Email: {supplier.email}</p>
        </div>
      )}
      {certificate && (
        <div className="mb-4">
          <p>Certificate Type: {certificate.type}</p>
          <p>Current Expiration Date: {new Date(certificate.expirationDate).toLocaleDateString()}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="expirationDate">New Expiration Date</Label>
          <Input
            id="expirationDate"
            name="expirationDate"
            type="date"
            required
            defaultValue={certificate?.expirationDate.split("T")[0]}
          />
        </div>
        <div>
          <Label htmlFor="file">New Certificate File (PDF)</Label>
          <Input id="file" name="file" type="file" accept=".pdf" required />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Certificate"}
        </Button>
      </form>
    </div>
  )
}

