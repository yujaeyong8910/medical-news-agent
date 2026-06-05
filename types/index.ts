export interface Article {
  id: string
  source: string
  source_url: string | null
  title: string
  url: string
  original_content: string | null
  summary: string | null
  tags: string[] | null
  disease_keywords: string[] | null
  severity: 'low' | 'medium' | 'high' | 'critical' | null
  published_at: string | null
  collected_at: string
  language: string
}

export type SourceName = 'WHO' | 'CDC' | 'NIH' | 'PubMed' | 'MedicalXpress' | 'Google News' | 'Reuters'

export const SOURCES: SourceName[] = [
  'WHO', 'CDC', 'NIH', 'PubMed', 'MedicalXpress', 'Google News', 'Reuters',
]

export const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  WHO:          { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  CDC:          { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  NIH:          { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  PubMed:       { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  MedicalXpress:{ bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'Google News':{ bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Reuters:      { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   dot: 'bg-gray-500' },
}

export const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  low:      { bg: 'bg-green-50',  text: 'text-green-700',  label: '낮음', dot: 'bg-green-400' },
  medium:   { bg: 'bg-yellow-50', text: 'text-yellow-700', label: '중간', dot: 'bg-yellow-400' },
  high:     { bg: 'bg-orange-50', text: 'text-orange-700', label: '높음', dot: 'bg-orange-400' },
  critical: { bg: 'bg-red-50',    text: 'text-red-700',    label: '긴급', dot: 'bg-red-500' },
}

export const SOURCE_EMOJI: Record<string, string> = {
  WHO:          '🌍',
  CDC:          '🏥',
  NIH:          '🔬',
  PubMed:       '📄',
  MedicalXpress:'📰',
  'Google News':'🔍',
  Reuters:      '📡',
}
