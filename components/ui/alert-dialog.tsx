"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
  children: React.ReactNode
}

interface AlertDialogContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AlertDialogContext = React.createContext<AlertDialogContextType | undefined>(undefined)

export function AlertDialog({ children }: AlertDialogProps) {
  const [open, setOpen] = React.useState(false)

  return <AlertDialogContext.Provider value={{ open, setOpen }}>{children}</AlertDialogContext.Provider>
}

export function AlertDialogTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogTrigger must be used within an AlertDialog")

  return React.cloneElement(children as React.ReactElement, {
    onClick: () => context.setOpen(true),
  })
}

export function AlertDialogContent({ children }: { children: React.ReactNode }) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogContent must be used within an AlertDialog")

  if (!context.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">{children}</div>
    </div>
  )
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex justify-end space-x-2 mt-4", className)}>{children}</div>
}

export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>
}

export function AlertDialogAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogAction must be used within an AlertDialog")

  const handleClick = () => {
    if (onClick) onClick()
    context.setOpen(false)
  }

  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export function AlertDialogCancel({ children }: { children: React.ReactNode }) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogCancel must be used within an AlertDialog")

  return (
    <button
      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
      onClick={() => context.setOpen(false)}
    >
      {children}
    </button>
  )
}

