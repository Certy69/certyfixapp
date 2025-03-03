"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Certificate {
  type: string
  expirationDate: string
  status: "valid" | "expiring" | "expired"
}

interface Supplier {
  _id: string
  name: string
  certificates: Certificate[]
}

interface DashboardData {
  suppliers: Supplier[]
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== "authenticated" || !session) {
        console.log("Session not authenticated or missing")
        return
      }

      console.log("Session user:", session.user) // Add this line

      try {
        console.log("Fetching dashboard data...")
        const response = await fetch("/api/suppliers/dashboard", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Failed to fetch dashboard data. Status: ${response.status}, Response: ${errorText}`)
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Fetched dashboard data:", data)
        setDashboardData(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchDashboardData()
  }, [status, toast, session])

  if (status === "loading" || !dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <div className="text-center text-red-500 p-4">Access Denied. Please log in.</div>
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>
  }

  // Get unique certificate types from all suppliers
  const certificateTypes = Array.from(
    new Set(dashboardData.suppliers.flatMap((supplier) => supplier.certificates.map((cert) => cert.type))),
  ).sort()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supplier Certificates Dashboard</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-medium">SUPPLIER</th>
                {certificateTypes.map((type) => (
                  <th key={type} className="text-left p-4 font-medium min-w-[200px]">
                    {type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dashboardData.suppliers.map((supplier) => (
                <tr key={supplier._id} className="border-t">
                  <td className="p-4 font-medium">{supplier.name}</td>
                  {certificateTypes.map((type) => {
                    const certificate = supplier.certificates.find((cert) => cert.type === type)
                    return (
                      <td key={type} className="p-4">
                        {certificate ? (
                          <div className="space-y-2">
                            <Badge
                              variant={
                                certificate.status === "valid"
                                  ? "default"
                                  : certificate.status === "expiring"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {certificate.status}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              Expires: {new Date(certificate.expirationDate).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not available</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

