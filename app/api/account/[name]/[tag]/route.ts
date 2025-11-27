import { NextResponse } from 'next/server'

const cache = new Map<string, { data: unknown; time: number }>()
const CACHE_TTL = 5 * 60 * 1000

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string; tag: string }> }
) {
  const { name, tag } = await params
  const key = `account:${name}:${tag}`
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
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers: { 'X-Riot-Token': apikey } }
    )

    if (!resp.ok) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const data = await resp.json()
    const result = {
      puuid: data.puuid,
      name: data.gameName,
      tag: data.tagLine,
    }

    cache.set(key, { data: result, time: Date.now() })
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
  } catch {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 })
  }
}

