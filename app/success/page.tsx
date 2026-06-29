import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8">Welcome to RealCRM Pro! Your account is now active.</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-medium">
          Go to Dashboard →
        </Link>
      </div>
    </div>
  )
}