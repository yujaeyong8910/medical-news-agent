import type { RawArticle } from './types'

interface ESearchResult {
  esearchresult: { idlist: string[] }
}

interface ESummaryItem {
  uid: string
  title: string
  source: string
  pubdate: string
  fulljournalname: string
  authors: Array<{ name: string }>
}

interface ESummaryResult {
  result: Record<string, ESummaryItem>
}

const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const HEADERS = { 'User-Agent': 'MedicalNewsAgent/1.0' }

export async function crawlPubMed(): Promise<RawArticle[]> {
  try {
    // Search recent disease/outbreak articles from the last 7 days
    const searchRes = await fetch(
      `${BASE}/esearch.fcgi?db=pubmed&term=disease+outbreak+OR+infectious+disease+OR+epidemic&sort=pub+date&retmode=json&retmax=15&datetype=pdat&reldate=7`,
      { headers: HEADERS, cache: 'no-store' }
    )
    if (!searchRes.ok) throw new Error(`esearch HTTP ${searchRes.status}`)

    const searchData: ESearchResult = await searchRes.json()
    const ids = searchData.esearchresult?.idlist ?? []
    if (ids.length === 0) return []

    const summaryRes = await fetch(
      `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`,
      { headers: HEADERS, cache: 'no-store' }
    )
    if (!summaryRes.ok) throw new Error(`esummary HTTP ${summaryRes.status}`)

    const summaryData: ESummaryResult = await summaryRes.json()

    return ids
      .map((id) => {
        const item = summaryData.result?.[id]
        if (!item?.title) return null
        const authors = item.authors?.slice(0, 3).map((a) => a.name).join(', ') ?? ''
        return {
          source: 'PubMed',
          title: item.title,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          content: [
            `Journal: ${item.fulljournalname || item.source}`,
            authors && `Authors: ${authors}`,
            `Published: ${item.pubdate}`,
          ].filter(Boolean).join('. '),
          publishedAt: item.pubdate ? new Date(item.pubdate) : undefined,
        } satisfies RawArticle
      })
      .filter((a): a is RawArticle => a !== null)
  } catch (err) {
    console.error('[PubMed] crawl failed:', err)
    return []
  }
}
