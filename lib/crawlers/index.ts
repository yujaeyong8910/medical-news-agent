import { crawlWHO } from './who'
import { crawlCDC } from './cdc'
import { crawlNIH } from './nih'
import { crawlPubMed } from './pubmed'
import { crawlMedicalXpress } from './medicalxpress'
import { crawlGoogleNews } from './google-news'
import { crawlReuters } from './reuters'
import type { RawArticle } from './types'

export type { RawArticle } from './types'

export interface CrawlResult {
  source: string
  count: number
  error?: string
}

const CRAWLERS: Record<string, () => Promise<RawArticle[]>> = {
  WHO: crawlWHO,
  CDC: crawlCDC,
  NIH: crawlNIH,
  PubMed: crawlPubMed,
  MedicalXpress: crawlMedicalXpress,
  'Google News': crawlGoogleNews,
  Reuters: crawlReuters,
}

export async function crawlAll(sources?: string[]): Promise<{
  articles: RawArticle[]
  results: CrawlResult[]
}> {
  const entries = sources
    ? Object.entries(CRAWLERS).filter(([k]) => sources.includes(k))
    : Object.entries(CRAWLERS)

  const settled = await Promise.allSettled(
    entries.map(async ([source, fn]) => ({ source, articles: await fn() }))
  )

  const results: CrawlResult[] = []
  const articles: RawArticle[] = []

  settled.forEach((r, i) => {
    const source = entries[i][0]
    if (r.status === 'fulfilled') {
      results.push({ source, count: r.value.articles.length })
      articles.push(...r.value.articles)
    } else {
      results.push({ source, count: 0, error: String(r.reason) })
    }
  })

  return { articles, results }
}
