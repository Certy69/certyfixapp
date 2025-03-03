'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setVerificationStatus('success')
      } else {
        setVerificationStatus('error')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verificationStatus === 'verifying' && (
            <p className="text-center text-gray-700">Verifying your email...</p>
          )}
          {verificationStatus === 'success' && (
            <div className="text-center">
              <p className="text-green-600 mb-4">Your email has been successfully verified!</p>
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Proceed to login
              </Link>
            </div>
          )}
          {verificationStatus === 'error' && (
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to verify your email. The verification link may be invalid or expired.</p>
              <Link href="/register" className="text-blue-600 hover:text-blue-500">
                Try registering again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

