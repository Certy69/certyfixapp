import { Sidebar } from "@/components/dashboard/sidebar"
import { Providers } from "@/components/providers"
import type React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-8">{children}</div>
        </div>
      </div>
    </Providers>
  )
}

