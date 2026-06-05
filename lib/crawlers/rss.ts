import Parser from 'rss-parser'
import type { RawArticle } from './types'

type CustomItem = {
  'content:encoded'?: string
  contentEncoded?: string
  description?: string
  'dc:date'?: string
}

const parser = new Parser<Record<string, never>, CustomItem>({
  timeout: 15000,
  headers: {
    'User-Agent': 'MedicalNewsAgent/1.0 (+https://github.com/medical-news-agent)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:date', 'dc:date'],
    ],
  },
})

export async function parseRSSFeed(url: string, source: string): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(url)
    return feed.items
      .map((item) => ({
        source,
        title: item.title?.trim() ?? '',
        url: item.link?.trim() ?? '',
        content: item.contentEncoded ?? item.content ?? item.contentSnippet ?? item.description ?? '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
      }))
      .filter((a) => a.title && a.url)
  } catch (err) {
    console.error(`[${source}] RSS fetch failed (${url}):`, err)
    return []
  }
}
