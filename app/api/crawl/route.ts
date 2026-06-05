import { NextRequest, NextResponse } from 'next/server'
import { crawlAll } from '@/lib/crawlers'
import { supabaseAdmin } from '@/lib/supabase'
import { summarizeArticle } from '@/lib/openrouter'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const sources = body.sources as string[] | undefined

    const { articles, results } = await crawlAll(sources)

    if (articles.length === 0) {
      return NextResponse.json({ message: '수집된 기사가 없습니다.', results, saved: 0 })
    }

    // Deduplicate by URL against DB
    const urls = [...new Set(articles.map((a) => a.url).filter(Boolean))]
    const { data: existing } = await supabaseAdmin
      .from('articles')
      .select('url')
      .in('url', urls)

    const seen = new Set((existing ?? []).map((e: { url: string }) => e.url))
    const fresh = articles.filter((a) => a.url && !seen.has(a.url))

    if (fresh.length === 0) {
      return NextResponse.json({ message: '새 기사가 없습니다.', results, saved: 0 })
    }

    // Summarise up to 20 new articles per run to stay within budget
    const toProcess = fresh.slice(0, 20)
    const rows = []

    for (const article of toProcess) {
      let summaryData = null
      try {
        summaryData = await summarizeArticle(article.title, article.content ?? article.title)
        // Rate-limit OpenRouter calls
        await new Promise((r) => setTimeout(r, 600))
      } catch (e) {
        console.error(`[summarize] ${article.title.slice(0, 60)}:`, e)
      }

      rows.push({
        source: article.source,
        title: article.title,
        url: article.url,
        original_content: article.content?.slice(0, 5000) ?? null,
        summary: summaryData?.summary ?? null,
        disease_keywords: summaryData?.keywords ?? null,
        severity: summaryData?.severity ?? null,
        published_at: article.publishedAt?.toISOString() ?? null,
        language: 'en',
      })
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('articles')
      .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
      .select('id')

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: '수집 완료',
      results,
      saved: inserted?.length ?? 0,
      total_found: articles.length,
      new_articles: fresh.length,
    })
  } catch (err) {
    console.error('Crawl error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '알 수 없는 오류' },
      { status: 500 }
    )
  }
}
