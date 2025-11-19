'use client';

import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/members')}
            className="btn-primary w-full"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary w-full"
          >
            Return to Dashboard
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Need help? Contact the treasurer.
        </p>
      </div>
    </div>
  );
}

