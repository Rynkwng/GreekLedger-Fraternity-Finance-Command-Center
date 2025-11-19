'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for your payment. Your dues have been recorded and your balance has been updated.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => router.push('/members')}
            className="btn-secondary w-full"
          >
            View Members
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Redirecting to dashboard in 5 seconds...
        </p>
      </div>
    </div>
  );
}

