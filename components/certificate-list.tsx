import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Certificate {
  id: string
  type: string
  expirationDate: string
  uploadDate: string
  fileUrl: string
}

interface CertificateListProps {
  certificates: Certificate[]
  onUpdateCertificate: (
    id: string,
    updatedCertificate: Partial<Omit<Certificate, "id" | "uploadDate" | "fileUrl">>,
  ) => Promise<void>
  onDeleteCertificate: (id: string) => Promise<void>
}

export function CertificateList({ certificates, onUpdateCertificate, onDeleteCertificate }: CertificateListProps) {
  const { toast } = useToast()
  const [editingCertId, setEditingCertId] = useState<string | null>(null)
  const [editedCertificate, setEditedCertificate] = useState<Partial<Certificate>>({})

  const handleEdit = (cert: Certificate) => {
    setEditingCertId(cert.id)
    setEditedCertificate(cert)
  }

  const handleSave = async () => {
    if (!editingCertId) return

    try {
      const { id, uploadDate, fileUrl, ...updatedCertificate } = editedCertificate
      await onUpdateCertificate(editingCertId, updatedCertificate)
      setEditingCertId(null)
      setEditedCertificate({})
      toast({
        title: "Certificate Updated",
        description: "The certificate has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the certificate. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditingCertId(null)
    setEditedCertificate({})
  }

  if (certificates.length === 0) {
    return <p>No certificates have been uploaded for this supplier.</p>
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => (
        <Card key={cert.id}>
          <CardHeader>
            <CardTitle>{cert.type}</CardTitle>
          </CardHeader>
          <CardContent>
            {editingCertId === cert.id ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`type-${cert.id}`}>Certificate Type</Label>
                  <Input
                    id={`type-${cert.id}`}
                    value={editedCertificate.type || ""}
                    onChange={(e) => setEditedCertificate({ ...editedCertificate, type: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`expirationDate-${cert.id}`}>Expiration Date</Label>
                  <Input
                    id={`expirationDate-${cert.id}`}
                    type="date"
                    value={editedCertificate.expirationDate || ""}
                    onChange={(e) => setEditedCertificate({ ...editedCertificate, expirationDate: e.target.value })}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p>Expiration Date: {new Date(cert.expirationDate).toLocaleDateString()}</p>
                <p>Upload Date: {new Date(cert.uploadDate).toLocaleDateString()}</p>
                <div className="mt-2 space-x-2">
                  <Button onClick={() => window.open(cert.fileUrl, "_blank", "noopener,noreferrer")}>
                    View Certificate
                  </Button>
                  <Button variant="outline" onClick={() => handleEdit(cert)}>
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the certificate.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteCertificate(cert.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

