"use client"

import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { UserProfile } from '@/lib/context/customer-auth-context'
import { ChevronLeft } from 'lucide-react'

interface MobileAccountHeaderProps {
  user: User | null
  profile: UserProfile | null
}

export function MobileAccountHeader({ user, profile }: MobileAccountHeaderProps) {
  const router = useRouter()
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="bg-gradient-to-br from-stone-600 to-stone-800 pt-6 pb-24 px-5">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/')}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Profile Avatar & Info */}
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 ring-4 ring-white/30">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-white">{initials}</span>
          )}
        </div>

        {/* Name & Email */}
        <h1 className="text-2xl font-bold text-white mb-1">{displayName}</h1>
        <p className="text-sm text-stone-200">{user?.email}</p>
      </div>
    </div>
  )
}
