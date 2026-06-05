import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import ArticleCard from '@/components/ArticleCard'
import SourceFilter from '@/components/SourceFilter'
import { SOURCES, type Article } from '@/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 21

async function getArticles(source: string | undefined, page: number) {
  const offset = (page - 1) * PAGE_SIZE
  let q = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('collected_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (source) q = q.eq('source', source)

  const { data, count, error } = await q
  if (error) throw new Error(error.message)
  return { articles: (data ?? []) as Article[], total: count ?? 0 }
}

async function getSourceCounts(): Promise<Record<string, number>> {
  const results = await Promise.allSettled(
    SOURCES.map(async (src) => {
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('source', src)
      return { src, count: count ?? 0 }
    })
  )

  const counts: Record<string, number> = {}
  for (const r of results) {
    if (r.status === 'fulfilled') {
      counts[r.value.src] = r.value.count
    }
  }
  return counts
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="h-3 bg-gray-100 rounded w-full mb-1" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
    </div>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; page?: string }>
}) {
  const params = await searchParams
  const currentSource = params.source && params.source !== 'all' ? params.source : undefined
  const page = Math.max(1, parseInt(params.page ?? '1'))

  const [{ articles, total }, sourceCounts] = await Promise.all([
    getArticles(currentSource, page),
    getSourceCounts(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const totalArticles = Object.values(sourceCounts).reduce((a, b) => a + b, 0)
  const displaySource = params.source ?? 'all'

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats + Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">최신 의료 뉴스</h2>
          <p className="text-sm text-gray-500 mt-1">
            총 <span className="font-semibold text-gray-700">{totalArticles.toLocaleString()}</span>개 기사 수집됨 · AI 한국어 요약 제공
          </p>
        </div>

        {/* Source Filter */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded-xl animate-pulse" />}>
            <SourceFilter counts={sourceCounts} currentSource={displaySource} />
          </Suspense>
        </div>

        {/* Severity Legend */}
        <div className="flex items-center gap-4 mb-5 text-xs text-gray-500">
          <span className="font-medium">위험도:</span>
          {(['low','medium','high','critical'] as const).map((sev) => {
            const colors = { low:'bg-green-400', medium:'bg-yellow-400', high:'bg-orange-400', critical:'bg-red-500' }
            const labels = { low:'낮음', medium:'중간', high:'높음', critical:'긴급' }
            return (
              <span key={sev} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${colors[sev]}`} />
                {labels[sev]}
              </span>
            )
          })}
        </div>

        {/* Articles */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={`?${new URLSearchParams({ ...(currentSource ? { source: currentSource } : {}), page: String(page - 1) })}`}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                  >
                    ← 이전
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`?${new URLSearchParams({ ...(currentSource ? { source: currentSource } : {}), page: String(p) })}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={`?${new URLSearchParams({ ...(currentSource ? { source: currentSource } : {}), page: String(page + 1) })}`}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
                  >
                    다음 →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 수집된 기사가 없습니다</h3>
            <p className="text-gray-500 text-sm mb-6">
              오른쪽 상단의 <strong>&ldquo;지금 수집&rdquo;</strong> 버튼을 눌러<br />
              WHO, CDC, NIH 등에서 최신 의료 뉴스를 가져오세요.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
              {[
                { icon: '🌍', label: 'WHO, CDC, NIH', desc: '공식 보건 기관 뉴스' },
                { icon: '📄', label: 'PubMed', desc: '최신 의학 연구 논문' },
                { icon: '📰', label: 'MedicalXpress', desc: '의학 전문 미디어' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 text-center text-xs text-gray-400">
        의료 뉴스 에이전트 · WHO, CDC, NIH, PubMed, MedicalXpress, Google News, Reuters 자동 수집 · AI 한국어 요약 powered by OpenRouter
      </footer>
    </div>
  )
}
