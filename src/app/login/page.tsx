"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from 'next/image'
import { useCustomerAuth } from '@/lib/hooks'

export default function AuthPage() {
  const {
    formData,
    isLogin,
    showPassword,
    isLoading,
    isRedirecting,
    showForgotPassword,
    error,
    success,
    updateFormData,
    toggleAuthMode,
    togglePasswordVisibility,
    toggleForgotPassword,
    handleSubmit,
    handleForgotPassword,
    handleSocialLogin,
    canSubmit
  } = useCustomerAuth()

  // Show redirecting state if user is already logged in
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin mb-4"></div>
            <p className="text-stone-600 text-center">You're already signed in! Redirecting to your account...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-stone-400 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 border-2 border-stone-500 rotate-45 animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-16 h-16 border-2 border-stone-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-stone-500 rotate-12 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "2s" }}
        ></div>
        <svg
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 opacity-40 animate-pulse"
          viewBox="0 0 100 100"
        >
          <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M30,30 L70,30 L70,70 L30,70 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Link>
        </div>

        {!showForgotPassword ? (
          <Card className="w-full bg-gradient-to-br from-stone-100/95 via-stone-50/90 to-stone-100/95 backdrop-blur-xl border-2 border-stone-200/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:border-stone-300/70">
            <CardHeader className="text-center space-y-6 pb-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-stone-200/50">
                  <Image
                    src="/logo.svg"
                    alt="SideHusl"
                    width={120}
                    height={87}
                    className="scale-75"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-stone-800 drop-shadow-sm">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-stone-600 text-sm">
                  {isLogin
                    ? "Sign in to track your orders and access favorites"
                    : "Create account to track orders and save favorites"}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3 shadow-lg animate-pulse">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="text-green-600 text-sm text-center bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3 shadow-lg animate-pulse">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-stone-700 font-medium text-sm">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-12 h-14 bg-gradient-to-r from-white/90 to-stone-50/80 border-2 border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-500/20 shadow-inner hover:shadow-lg transition-all duration-300 hover:border-stone-400"
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-stone-700 font-medium text-sm">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-12 h-14 bg-gradient-to-r from-white/90 to-stone-50/80 border-2 border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-500/20 shadow-inner hover:shadow-lg transition-all duration-300 hover:border-stone-400"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-stone-700 font-medium text-sm">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+27 81 234 5678"
                          className="pl-12 h-14 bg-gradient-to-r from-white/90 to-stone-50/80 border-2 border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-500/20 shadow-inner hover:shadow-lg transition-all duration-300 hover:border-stone-400"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-stone-700 font-medium text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-14 bg-gradient-to-r from-white/90 to-stone-50/80 border-2 border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-500/20 shadow-inner hover:shadow-lg transition-all duration-300 hover:border-stone-400"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-500 hover:text-stone-700 transition-all duration-200 hover:scale-110"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => toggleForgotPassword()}
                      className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
                      disabled={isLoading}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-stone-600 via-stone-700 to-stone-800 hover:from-stone-700 hover:via-stone-800 hover:to-stone-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ring-2 ring-stone-300/30 hover:ring-stone-400/50"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
                    </div>
                  ) : isLogin ? (
                    <span className="drop-shadow-sm">Sign In</span>
                  ) : (
                    <span className="drop-shadow-sm">Create Account</span>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-stone-500">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-white/90 to-stone-50/80 border-2 border-stone-300 hover:border-stone-400 text-stone-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-white/90 to-stone-50/80 border-2 border-stone-300 hover:border-stone-400 text-stone-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-stone-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="ml-1 text-stone-800 hover:text-stone-900 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full bg-gradient-to-br from-stone-100/95 via-stone-50/90 to-stone-100/95 backdrop-blur-xl border-2 border-stone-200/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:border-stone-300/70">
            <CardHeader className="text-center space-y-6 pb-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-stone-200/50">
                  <Mail className="w-16 h-16 text-stone-600" />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-stone-800 drop-shadow-sm">Reset Password</CardTitle>
                <CardDescription className="text-stone-600 text-sm">
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="text-red-600 text-sm text-center bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3 shadow-lg animate-pulse">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="text-green-600 text-sm text-center bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3 shadow-lg animate-pulse">
                  {success}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-stone-700 font-medium text-sm">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-12 h-14 bg-gradient-to-r from-white/90 to-stone-50/80 border-2 border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-500/20 shadow-inner hover:shadow-lg transition-all duration-300 hover:border-stone-400"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-stone-600 via-stone-700 to-stone-800 hover:from-stone-700 hover:via-stone-800 hover:to-stone-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ring-2 ring-stone-300/30 hover:ring-stone-400/50"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    <span className="drop-shadow-sm">Send Reset Link</span>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
                  disabled={isLoading}
                >
                  Back to Sign In
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}