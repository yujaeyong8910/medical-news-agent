import { parseRSSFeed } from './rss'
import type { RawArticle } from './types'

// Google News RSS — Health topic feed
const HEALTH_FEED = 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ'

export async function crawlGoogleNews(): Promise<RawArticle[]> {
  return parseRSSFeed(HEALTH_FEED, 'Google News')
}
