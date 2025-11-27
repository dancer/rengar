import { NextResponse } from 'next/server'

const cache: { data: unknown; time: number } | null = null
let contentcache = cache
const CACHE_TTL = 60 * 60 * 1000

export async function GET(request: Request) {
  const url = new URL(request.url)
  const region = url.searchParams.get('region') || 'eu'

  if (contentcache && Date.now() - contentcache.time < CACHE_TTL) {
    return NextResponse.json(contentcache.data, { headers: { 'X-Cache': 'HIT' } })
  }

  const apikey = process.env.RIOT_API_KEY
  if (!apikey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const resp = await fetch(
      `https://${region}.api.riotgames.com/val/content/v1/contents`,
      { headers: { 'X-Riot-Token': apikey } }
    )

    if (!resp.ok) {
      return NextResponse.json({ error: 'Content not available' }, { status: resp.status })
    }

    const data = await resp.json()
    const result = {
      version: data.version,
      acts: data.acts?.filter((a: { isActive: boolean }) => a.isActive).map((a: { id: string; name: string; type: string }) => ({
        id: a.id,
        name: a.name,
        type: a.type,
      })),
      agents: data.characters?.map((c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      })),
      maps: data.maps?.map((m: { id: string; name: string }) => ({
        id: m.id,
        name: m.name,
      })),
      modes: data.gameModes?.map((g: { id: string; name: string }) => ({
        id: g.id,
        name: g.name,
      })),
    }

    contentcache = { data: result, time: Date.now() }
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
  } catch {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 })
  }
}

