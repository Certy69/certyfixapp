import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AllSuppliersPage() {
  // This is a placeholder. In a real application, you'd fetch this data from your backend.
  const suppliers = [
    { id: 1, name: 'Supplier A', email: 'supplierA@example.com', certificateExpiry: '2023-12-31' },
    { id: 2, name: 'Supplier B', email: 'supplierB@example.com', certificateExpiry: '2024-06-30' },
    { id: 3, name: 'Supplier C', email: 'supplierC@example.com', certificateExpiry: '2023-09-15' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">All Suppliers</h2>
        <Button asChild>
          <Link href="/dashboard/suppliers/add">Add New Supplier</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader>
              <CardTitle>{supplier.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {supplier.email}</p>
              <p>Certificate Expiry: {supplier.certificateExpiry}</p>
              <Button asChild className="mt-4">
                <Link href={`/dashboard/suppliers/${supplier.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

