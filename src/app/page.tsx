export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2">
          Pai&apos;s Taste Food Special
        </h1>
        <p className="text-stone-600">
          Traditional South African cuisine for pickup
        </p>
        <p className="text-stone-500 mt-2">
          📍 Montana, Sinoville & Annlin | 📞 +27 81 454 1020
        </p>
      </header>
      
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Menu Coming Soon</h2>
        <p className="text-stone-600">
          We&apos;re setting up our online ordering system. 
          Call us to place your order!
        </p>
      </div>
    </div>
  )
}