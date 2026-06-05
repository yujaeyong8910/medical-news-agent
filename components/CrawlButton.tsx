'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrawlButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)

  const handleCrawl = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ msg: `${data.saved ?? 0}개 새 기사 저장됨`, ok: true })
        router.refresh()
      } else {
        setStatus({ msg: `오류: ${data.error}`, ok: false })
      }
    } catch {
      setStatus({ msg: '네트워크 오류', ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {status && (
        <span className={`text-xs font-medium ${status.ok ? 'text-green-600' : 'text-red-500'}`}>
          {status.msg}
        </span>
      )}
      <button
        onClick={handleCrawl}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
                   hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            수집 중...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            지금 수집
          </>
        )}
      </button>
    </div>
  )
}
