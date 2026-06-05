import { parseRSSFeed } from './rss'
import type { RawArticle } from './types'

export async function crawlNIH(): Promise<RawArticle[]> {
  const results = await Promise.allSettled([
    parseRSSFeed('https://www.nih.gov/rss/allevents.xml', 'NIH'),
    parseRSSFeed('https://www.nih.gov/rss/news.xml', 'NIH'),
  ])

  return results
    .filter((r): r is PromiseFulfilledResult<RawArticle[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}
