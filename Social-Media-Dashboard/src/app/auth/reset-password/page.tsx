"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to forgot password page since we handle reset there
    router.push('/auth/forgot-password')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Redirecting...</h1>
        <p className="text-gray-600 mt-2">Taking you to password reset page</p>
      </div>
    </div>
  )
}