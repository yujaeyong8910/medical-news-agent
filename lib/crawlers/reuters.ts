import { parseRSSFeed } from './rss'
import type { RawArticle } from './types'

export async function crawlReuters(): Promise<RawArticle[]> {
  // Try multiple Reuters feed endpoints
  const results = await Promise.allSettled([
    parseRSSFeed('https://feeds.reuters.com/reuters/healthNews', 'Reuters'),
    parseRSSFeed('https://feeds.reuters.com/reuters/science', 'Reuters'),
  ])

  const articles = results
    .filter((r): r is PromiseFulfilledResult<RawArticle[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  if (articles.length > 0) return articles

  // Fallback: parse Reuters health page JSON-LD if RSS is unavailable
  try {
    const res = await fetch('https://www.reuters.com/world/health/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsBot/1.0)',
        Accept: 'text/html',
      },
      cache: 'no-store',
    })
    if (!res.ok) return []

    const html = await res.text()

    // Extract article links and titles from HTML
    const items: RawArticle[] = []
    const articleRegex = /"headline":"([^"]+)","url":"([^"]+)"/g
    let match
    while ((match = articleRegex.exec(html)) !== null && items.length < 15) {
      const title = match[1]
      const url = match[2].startsWith('http') ? match[2] : `https://www.reuters.com${match[2]}`
      if (title && url && url.includes('reuters.com')) {
        items.push({ source: 'Reuters', title, url })
      }
    }
    return items
  } catch (err) {
    console.error('[Reuters] fallback scrape failed:', err)
    return []
  }
}
