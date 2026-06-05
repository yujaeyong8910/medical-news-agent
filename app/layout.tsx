import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '의료 뉴스 에이전트',
  description: 'WHO, CDC, NIH, PubMed 등 주요 의료 기관의 최신 질병 정보를 자동 수집하고 AI로 요약합니다.',
  keywords: ['의료 뉴스', '질병 정보', 'WHO', 'CDC', 'NIH', 'PubMed', '의학 정보'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
