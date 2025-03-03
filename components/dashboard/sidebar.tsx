'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Settings, LucideUser, Mail, LogOut, Shield } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { User } from "next-auth"
import { TypeIcon as type, LucideIcon } from 'lucide-react'

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

const clientMenuItems: MenuItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: LucideUser, label: 'Profile', href: '/dashboard/profile' },
  { 
    icon: Users, 
    label: 'Suppliers', 
    href: '/dashboard/suppliers'
  },
  { icon: Mail, label: 'Contact', href: '/dashboard/contact' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

// Removed adminMenuItems array

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // Removed isAdmin check
  const menuItems: MenuItem[] = clientMenuItems

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl font-bold text-blue-600">Certyfix</h1>
      </div>
      <ul className="flex flex-col py-4">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} 
                  className={`flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 ${
                    pathname === item.href ? 'text-blue-600' : 'text-gray-500'
                  }`}>
              <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

