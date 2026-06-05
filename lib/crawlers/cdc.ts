import { parseRSSFeed } from './rss'
import type { RawArticle } from './types'

export async function crawlCDC(): Promise<RawArticle[]> {
  const results = await Promise.allSettled([
    // CDC Newsroom press releases
    parseRSSFeed('https://tools.cdc.gov/api/v2/resources/media/403372.rss', 'CDC'),
    // CDC MMWR
    parseRSSFeed('https://tools.cdc.gov/api/v2/resources/media/132608.rss', 'CDC'),
  ])

  return results
    .filter((r): r is PromiseFulfilledResult<RawArticle[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}
