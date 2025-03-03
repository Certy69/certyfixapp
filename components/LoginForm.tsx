'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Switch } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      rememberMe: rememberMe.toString(),
    })

    if (result?.error) {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.ok) {
      router.push('/dashboard')
    } else {
      throw new Error('An unexpected error occurred')
    }
  } catch (error) {
    console.error('Login error:', error)
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    })
  }
}

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Log in to your account</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email input */}
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* Password input */}
        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Switch
              checked={rememberMe}
              onChange={setRememberMe}
              className={`${
                rememberMe ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  rememberMe ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <Label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Remember me
            </Label>
          </div>
          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </div>
        </div>
        {/* Submit button */}
        <div>
          <Button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Sign in
          </Button>
        </div>
      </form>
      {/* Register link */}
      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

