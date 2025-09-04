"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Check if user exists with this email
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStep('password')
      } else {
        setError('No account found with this email address.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <img 
                    src="/OfinaPulse-Logo.png" 
                    alt="OfinaPulse Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">OfinaPulse</h1>
              <p className="text-gray-600 mt-2">Password reset successful</p>
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">Password Updated!</CardTitle>
                <CardDescription>
                  Your password has been successfully updated for {email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    You can now sign in with your new password.
                  </p>
                </div>

                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <img 
                    src="/OfinaPulse-Logo.png" 
                    alt="OfinaPulse Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">OfinaPulse</h1>
              <p className="text-gray-600 mt-2">Set new password</p>
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">New Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your new password for {email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating Password..." : "Update Password"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <button
                    onClick={() => {
                      setStep('email')
                      setNewPassword('')
                      setConfirmPassword('')
                      setError('')
                    }}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Email
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <img 
                  src="/OfinaPulse-Logo.png" 
                  alt="OfinaPulse Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">OfinaPulse</h1>
            <p className="text-gray-600 mt-2">Reset your password</p>
          </div>

          {/* Forgot Password Form */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Forgot Password?</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we&apos;ll help you reset your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@ofinapulse.com"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Continue"}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Enter your email address to reset your password directly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Secure Password Recovery
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
