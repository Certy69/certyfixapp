"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Plus,
  Search,
  AlertCircle,
  Users,
  Building2,
  BadgeIcon as Certificate,
  Filter,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Supplier {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  status?: "active" | "inactive"
  type?: "manufacturer" | "distributor" | "retailer"
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "manufacturer",
    status: "active",
  })
  const [isAddingSupplier, setIsAddingSupplier] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/suppliers")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setSuppliers(data)
      } else if (data.suppliers && Array.isArray(data.suppliers)) {
        setSuppliers(data.suppliers)
      } else {
        console.error("Unexpected data format:", data)
        setSuppliers([])
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      setError("Failed to load suppliers. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.includes(searchTerm)) &&
      (filterType === "all" || supplier.type === filterType),
  )

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingSupplier(true)
    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      })
      if (!response.ok) throw new Error("Failed to add supplier")
      const addedSupplier = await response.json()
      setSuppliers([...suppliers, addedSupplier])
      setNewSupplier({ name: "", email: "", phone: "", address: "", type: "manufacturer", status: "active" })
      toast({ title: "Success", description: "New supplier added successfully." })
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({ title: "Error", description: "Failed to add new supplier. Please try again.", variant: "destructive" })
    } finally {
      setIsAddingSupplier(false)
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete supplier")
      setSuppliers(suppliers.filter((supplier) => supplier._id !== supplierId))
      toast({ title: "Success", description: "Supplier deleted successfully." })
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({ title: "Error", description: "Failed to delete supplier. Please try again.", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.status === "active").length,
    manufacturers: suppliers.filter((s) => s.type === "manufacturer").length,
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="text-red-500 mt-4 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Add New Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Enter the details of the new supplier here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSupplier}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAddingSupplier}>
                  {isAddingSupplier ? "Adding..." : "Add Supplier"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{((stats.active / stats.total) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturers</CardTitle>
            <Certificate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.manufacturers}</div>
            <p className="text-xs text-muted-foreground">Primary suppliers</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manufacturer">Manufacturers</SelectItem>
              <SelectItem value="distributor">Distributors</SelectItem>
              <SelectItem value="retailer">Retailers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence>
        {filteredSuppliers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-10 bg-muted/50 rounded-lg"
          >
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-medium">No suppliers found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms or filters." : "Get started by adding a new supplier."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setFilterType("all")
              }}
            >
              Reset Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-md border bg-card"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier, index) => (
                  <motion.tr
                    key={supplier._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {supplier.name}
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {supplier.type || "manufacturer"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          {supplier.email}
                        </span>
                        <span className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          {supplier.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {supplier.address}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                        {supplier.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Link href={`/dashboard/suppliers/${supplier._id}`}>View</Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="shadow-sm hover:shadow-md transition-shadow"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the supplier and all
                                associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSupplier(supplier._id)}>
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

