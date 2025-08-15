"use client"

import type React from "react"

import { useState } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function AdminLogin() {
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      if (pin === "1234") {
        window.location.href = "/admin"
      } else {
        setError("Invalid PIN. Please try again.")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-stone-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-amber-400 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 border-2 border-stone-400 rotate-45 animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-16 h-16 border-2 border-amber-500 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-20 h-20 border-2 border-stone-400 rotate-12 animate-bounce"
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

      <Card className="w-full max-w-md bg-gradient-to-br from-stone-100/95 via-amber-50/90 to-stone-100/95 backdrop-blur-xl border-2 border-stone-200/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:border-amber-200/70">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-200 via-stone-200 to-amber-300 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-amber-100/50">
              <img
                src="/placeholder-2jitw.png"
                alt="Pai's Taste Logo"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 via-stone-700 to-amber-800 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-4 ring-amber-200/30">
                <Lock className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-stone-800 drop-shadow-sm">Admin Access</h1>
            <p className="text-stone-600 text-sm">Pai's Taste Admin Dashboard</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl font-mono tracking-widest h-14 bg-gradient-to-r from-white/90 to-amber-50/80 border-2 border-stone-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 shadow-inner hover:shadow-lg transition-all duration-300 hover:border-amber-400"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500 hover:text-amber-600 transition-all duration-200 hover:scale-110"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3 shadow-lg animate-shake">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || pin.length < 4}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-600 via-stone-700 to-amber-800 hover:from-amber-700 hover:via-stone-800 hover:to-amber-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ring-2 ring-amber-200/30 hover:ring-amber-300/50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Accessing...</span>
                </div>
              ) : (
                <span className="drop-shadow-sm">Access Dashboard</span>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-stone-500 space-y-1 bg-gradient-to-r from-stone-50/50 to-amber-50/50 rounded-lg p-3 border border-stone-200/50">
            <p className="flex items-center justify-center space-x-1">
              <span>🔒</span>
              <span className="font-medium">Secure Admin Access</span>
            </p>
            <p>For authorized restaurant staff only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
