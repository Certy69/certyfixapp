import RegisterForm from '@/components/Registerform'
import Image from 'next/image'
import ProgressBar from '@/components/ProgressBar'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
        <ProgressBar currentStep={1} />
        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

