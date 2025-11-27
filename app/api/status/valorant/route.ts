import { NextResponse } from 'next/server'

const cache = new Map<string, { data: unknown; time: number }>()
const CACHE_TTL = 60 * 1000

export async function GET(request: Request) {
  const url = new URL(request.url)
  const region = url.searchParams.get('region') || 'eu'

  const key = `valstatus:${region}`
  const cached = cache.get(key)

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
  }

  const apikey = process.env.RIOT_API_KEY
  if (!apikey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const resp = await fetch(
      `https://${region}.api.riotgames.com/val/status/v1/platform-data`,
      { headers: { 'X-Riot-Token': apikey } }
    )

    if (!resp.ok) {
      return NextResponse.json({ error: 'Status not available' }, { status: resp.status })
    }

    const data = await resp.json()
    const result = {
      id: data.id,
      name: data.name,
      region,
      maintenances: data.maintenances?.map((m: { id: number; titles: { content: string }[]; updates: { created_at: string }[] }) => ({
        id: m.id,
        title: m.titles?.[0]?.content,
        updated: m.updates?.[0]?.created_at,
      })),
      incidents: data.incidents?.map((i: { id: number; titles: { content: string }[]; updates: { created_at: string }[] }) => ({
        id: i.id,
        title: i.titles?.[0]?.content,
        updated: i.updates?.[0]?.created_at,
      })),
    }

    cache.set(key, { data: result, time: Date.now() })
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
  } catch {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 })
  }
}

