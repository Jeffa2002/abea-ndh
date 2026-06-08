'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ReviewActionsProps = {
  submissionId: string
  status: string
}

export function ReviewActions({ submissionId, status }: ReviewActionsProps) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loadingAction, setLoadingAction] = useState<'process' | 'reject' | null>(null)
  const [error, setError] = useState('')
  const canReview = status === 'SUBMITTED' || status === 'PROCESSING'

  async function submit(action: 'process' | 'reject') {
    setLoadingAction(action)
    setError('')
    const res = await fetch(`/api/admin/submissions/${submissionId}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    const data = await res.json() as { error?: string }
    setLoadingAction(null)
    if (!res.ok) {
      setError(data.error || 'Review action failed.')
      return
    }
    setNote('')
    router.refresh()
  }

  if (!canReview) {
    return <span className="text-xs text-gray-400">Reviewed</span>
  }

  return (
    <div className="min-w-[260px] space-y-2">
      <textarea
        value={note}
        onChange={event => setNote(event.target.value)}
        rows={2}
        placeholder="Optional processing note; required for rejection"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-orange-300"
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void submit('process')}
          disabled={loadingAction !== null}
          className="rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: '#052460' }}
        >
          {loadingAction === 'process' ? 'Processing...' : 'Process'}
        </button>
        <button
          type="button"
          onClick={() => void submit('reject')}
          disabled={loadingAction !== null}
          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-60"
        >
          {loadingAction === 'reject' ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
