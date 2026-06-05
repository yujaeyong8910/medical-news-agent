'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SOURCES, SOURCE_EMOJI } from '@/types'

interface Props {
  counts: Record<string, number>
  currentSource: string
}

export default function SourceFilter({ counts, currentSource }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const select = (source: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (source === 'all') {
      params.delete('source')
    } else {
      params.set('source', source)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const allSources = ['all', ...SOURCES] as const
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex gap-2 flex-wrap">
      {allSources.map((src) => {
        const active = currentSource === src
        const count = src === 'all' ? totalCount : counts[src] ?? 0

        return (
          <button
            key={src}
            onClick={() => select(src)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
              active
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {src !== 'all' && <span>{SOURCE_EMOJI[src]}</span>}
            <span>{src === 'all' ? '전체' : src}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
