import { parseRSSFeed } from './rss'
import type { RawArticle } from './types'

export async function crawlMedicalXpress(): Promise<RawArticle[]> {
  const results = await Promise.allSettled([
    parseRSSFeed('https://medicalxpress.com/rss-feed/', 'MedicalXpress'),
    parseRSSFeed('https://medicalxpress.com/rss-feed/breaking/', 'MedicalXpress'),
  ])

  return results
    .filter((r): r is PromiseFulfilledResult<RawArticle[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}
