import { MenuGrid } from '@/components/menu/menu-grid'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <Image
            src="/logo.svg"
            alt="Pai's Taste Food Special"
            width={400}
            height={290}
            className="mx-auto mb-4"
          />
          <p className="text-stone-600">
            Traditional South African cuisine for pickup
          </p>
          <p className="text-stone-500 mt-2">
            📍 Montana, Sinoville & Annlin | 📞 +27 81 454 1020
          </p>
        </header>

        <MenuGrid />
      </div>
    </div>
  )
}