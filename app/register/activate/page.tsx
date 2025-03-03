import Image from 'next/image'
import ProgressBar from '@/components/ProgressBar'

export default function ActivateAccountPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Certyfix Logo"
            width={180}
            height={40}
            priority
          />
        </div>
        <ProgressBar currentStep={3} />
        <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Activate your account
          </h2>
          <p className="text-gray-600">
            Your account is now being activated. Please wait a moment...
          </p>
          {/* Add activation logic here */}
        </div>
      </div>
    </div>
  )
}

