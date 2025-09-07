"use client"

import { BusinessProvider } from '@/lib/contexts/business-context'

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <BusinessProvider>
            {children}
        </BusinessProvider>
    )
}