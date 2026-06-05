import { parseRSSFeed } from './rss'
import type { RawArticle } from './types'

export async function crawlWHO(): Promise<RawArticle[]> {
  return parseRSSFeed('https://www.who.int/rss-feeds/news-english.xml', 'WHO')
}
