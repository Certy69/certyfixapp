"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle2, XCircle, AlertTriangle, Bell, RefreshCw } from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

interface Certificate {
  id: string
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
  totalCertificates: number
  validCertificates: number
  expiringCertificates: number
  expiredCertificates: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== "authenticated" || !session) {
        console.log("Session not authenticated or missing")
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch("/api/dashboard", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
        }

        const data = await response.json()
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [status, toast, session])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>No data available. Please try again later.</p>
      </div>
    )
  }

  const { totalCertificates, validCertificates, expiringCertificates, expiredCertificates, suppliers } = dashboardData

  const pieChartData = {
    labels: ["Valid", "Expiring", "Expired"],
    datasets: [
      {
        data: [validCertificates, expiringCertificates, expiredCertificates],
        backgroundColor: ["#10B981", "#FBBF24", "#EF4444"],
        hoverBackgroundColor: ["#059669", "#D97706", "#DC2626"],
      },
    ],
  }

  const supplierBarChartData = suppliers
    .map((supplier) => ({
      name: supplier.name,
      valid: supplier.certificates.filter((cert) => cert.status === "valid").length,
      expiring: supplier.certificates.filter((cert) => cert.status === "expiring").length,
      expired: supplier.certificates.filter((cert) => cert.status === "expired").length,
    }))
    .sort((a, b) => b.expiring + b.expired - (a.expiring + a.expired))
    .slice(0, 5)

  const barChartData = {
    labels: supplierBarChartData.map((s) => s.name),
    datasets: [
      {
        label: "Valid",
        data: supplierBarChartData.map((s) => s.valid),
        backgroundColor: "#10B981",
      },
      {
        label: "Expiring",
        data: supplierBarChartData.map((s) => s.expiring),
        backgroundColor: "#FBBF24",
      },
      {
        label: "Expired",
        data: supplierBarChartData.map((s) => s.expired),
        backgroundColor: "#EF4444",
      },
    ],
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 space-y-8"
    >
      <h1 className="text-3xl font-bold">Certificate Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Certificates</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validCertificates}</div>
            <Progress value={(validCertificates / totalCertificates) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringCertificates}</div>
            <Progress value={(expiringCertificates / totalCertificates) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Certificates</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredCertificates}</div>
            <Progress value={(expiredCertificates / totalCertificates) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex justify-center items-center">
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Suppliers by Expiring/Expired Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificates Requiring Attention</CardTitle>
          <CardDescription>Certificates that are expiring soon or have already expired</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expiring" className="w-full">
            <TabsList>
              <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
            <TabsContent value="expiring">
              <div className="space-y-4">
                {suppliers
                  .flatMap((supplier) =>
                    supplier.certificates
                      .filter((cert) => cert.status === "expiring")
                      .map((cert) => ({ ...cert, supplierName: supplier.name })),
                  )
                  .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
                  .slice(0, 5)
                  .map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{cert.supplierName}</h3>
                        <p className="text-sm text-muted-foreground">{cert.type}</p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          Expiring Soon
                        </Badge>
                        <span className="text-sm">Expires: {new Date(cert.expirationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="expired">
              <div className="space-y-4">
                {suppliers
                  .flatMap((supplier) =>
                    supplier.certificates
                      .filter((cert) => cert.status === "expired")
                      .map((cert) => ({ ...cert, supplierName: supplier.name })),
                  )
                  .sort((a, b) => new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime())
                  .slice(0, 5)
                  .map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{cert.supplierName}</h3>
                        <p className="text-sm text-muted-foreground">{cert.type}</p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="destructive" className="mr-2">
                          Expired
                        </Badge>
                        <span className="text-sm">Expired: {new Date(cert.expirationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <span>5 certificates are expiring in the next 30 days</span>
            </li>
            <li className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span>3 certificates have expired this week</span>
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span>2 new suppliers added this month</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

