// @ts-nocheck
'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const metrics = searchParams.get('metrics') || '0'
  const period = searchParams.get('period') || ''

  const shortId = id.length > 16 ? id.slice(0, 8) + '...' + id.slice(-6) : id

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          {/* Checkmark */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1E3A5F' }}>Submission Received!</h1>
          <p className="text-gray-500 mb-8">Your data has been securely submitted to the ABEA National Data Hub.</p>

          {/* Details */}
          <div className="rounded-xl p-6 mb-8 text-left space-y-4" style={{ backgroundColor: '#F8FAFC' }}>
            {id && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Submission ID</span>
                <span className="text-sm font-mono font-semibold text-gray-800">{shortId}</span>
              </div>
            )}
            {period && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Reporting Period</span>
                <span className="text-sm font-semibold text-gray-800">{period}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Metrics Submitted</span>
              <span
                className="text-sm font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: '#00A99D' }}
              >
                {metrics} metric{parseInt(metrics) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* What happens next */}
          <div className="rounded-xl p-6 mb-8 text-left border border-blue-100" style={{ backgroundColor: '#EFF6FF' }}>
            <h3 className="font-bold text-sm mb-2" style={{ color: '#1E3A5F' }}>⏱ What happens next?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your data will be processed within 24 hours. Once processed, it contributes to industry benchmarks — visible to all participating organisations once the minimum threshold of 5 contributors is met.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/submissions"
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white text-center hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#1E3A5F' }}
            >
              View My Submissions
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-center border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Sub-note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? Contact{' '}
          <a href="mailto:admin@abea.org.au" className="underline hover:text-gray-600">
            admin@abea.org.au
          </a>
        </p>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
