import { NextResponse } from 'next/server'

const cache = new Map<string, { data: string; time: number }>()
const CACHE_TTL = 5 * 60 * 1000

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string; tag: string }> }
) {
  const { name, tag } = await params
  const key = `rank:${name}:${tag}`
  const cached = cache.get(key)
  
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return new Response(cached.data, { headers: { 'Content-Type': 'text/plain' } })
  }
  
  try {
    const resp = await fetch(
      `${request.url.split('/api/rank')[0]}/api/mmr/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
    )
    
    if (!resp.ok) {
      return new Response('Player not found', { status: 404 })
    }
    
    const data = await resp.json()
    const text = `${data.name}#${data.tag} is ${data.rank}${data.rr > 0 ? ` (${data.rr}rr)` : ''}`
    
    cache.set(key, { data: text, time: Date.now() })
    
    return new Response(text, { headers: { 'Content-Type': 'text/plain' } })
  } catch {
    return new Response('API error', { status: 500 })
  }
}

