export interface SummaryResult {
  summary: string
  keywords: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const SYSTEM_PROMPT = `당신은 의료 뉴스 분석 전문가입니다. 영어로 된 의료 뉴스 기사를 분석하고 한국어로 구조화된 요약을 제공하세요.

반드시 JSON 형식으로만 응답하세요:
{
  "summary": "2-3문장으로 된 한국어 핵심 요약",
  "keywords": ["질병/건강 키워드1", "키워드2", "키워드3"],
  "severity": "low|medium|high|critical"
}

severity 판단 기준:
- low: 일반 건강 정보, 기초 연구 결과
- medium: 주의가 필요한 질병 정보, 예방 권고사항
- high: 심각한 전염병 경보, 광범위한 건강 위협
- critical: 팬데믹, 긴급 공중보건 위기`

export async function summarizeArticle(title: string, content: string): Promise<SummaryResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://medical-news-agent.vercel.app',
      'X-Title': 'Medical News Agent',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `제목: ${title}\n\n내용: ${content.slice(0, 3000)}` },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  const text: string = data.choices?.[0]?.message?.content ?? '{}'

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return {
        summary: parsed.summary || '요약을 생성할 수 없습니다.',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
        severity: (['low', 'medium', 'high', 'critical'] as const).includes(parsed.severity)
          ? parsed.severity
          : 'medium',
      }
    }
  } catch {
    // fall through to default
  }

  return { summary: text.slice(0, 300), keywords: [], severity: 'medium' }
}
