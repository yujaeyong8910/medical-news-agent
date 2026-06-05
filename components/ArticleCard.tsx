import type { Article } from '@/types'
import { SOURCE_COLORS, SEVERITY_CONFIG } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '날짜 없음'
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ko })
  } catch {
    return '날짜 없음'
  }
}

export default function ArticleCard({ article }: { article: Article }) {
  const src = SOURCE_COLORS[article.source] ?? {
    bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400',
  }
  const sev = SEVERITY_CONFIG[article.severity ?? 'medium']
  const date = article.published_at ?? article.collected_at

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Severity accent line */}
      <div className={`h-1 w-full ${sev.dot} opacity-70`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${src.bg} ${src.text} ${src.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${src.dot}`} />
            {article.source}
          </span>
          {article.severity && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} animate-pulse`} />
              {sev.label}
            </span>
          )}
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 font-semibold text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2"
        >
          {article.title}
        </a>

        {/* Korean Summary */}
        {article.summary ? (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
            {article.summary}
          </p>
        ) : (
          <p className="text-gray-400 text-xs italic flex-1">요약 생성 중...</p>
        )}

        {/* Keywords */}
        {article.disease_keywords && article.disease_keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.disease_keywords.slice(0, 5).map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-blue-50 text-blue-600 font-medium">
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400">{timeAgo(date)}</span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium group-hover:underline"
          >
            원문 보기 →
          </a>
        </div>
      </div>
    </article>
  )
}
