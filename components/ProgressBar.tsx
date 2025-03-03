interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { number: 1, label: 'Register' },
    { number: 2, label: 'Check email' },
    { number: 3, label: 'Activate account' },
  ]

  return (
    <div className="w-full py-6">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="relative w-1/3">
              <div 
                className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {step.label}
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              style={{ width: '33.333%' }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                currentStep >= step.number ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

