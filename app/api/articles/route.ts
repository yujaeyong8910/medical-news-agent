import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '21'))
  const offset = (page - 1) * limit

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('collected_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (source && source !== 'all') {
    query = query.eq('source', source)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ articles: data ?? [], total: count ?? 0, page, limit })
}
