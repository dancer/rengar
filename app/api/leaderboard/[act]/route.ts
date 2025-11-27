import { NextResponse } from 'next/server'

const cache = new Map<string, { data: unknown; time: number }>()
const CACHE_TTL = 10 * 60 * 1000

export async function GET(
  request: Request,
  { params }: { params: Promise<{ act: string }> }
) {
  const { act } = await params
  const url = new URL(request.url)
  const region = url.searchParams.get('region') || 'eu'
  const size = Math.min(parseInt(url.searchParams.get('size') || '100'), 200)
  const start = parseInt(url.searchParams.get('start') || '0')

  const key = `leaderboard:${act}:${region}:${start}:${size}`
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
      `https://${region}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/${act}?size=${size}&startIndex=${start}`,
      { headers: { 'X-Riot-Token': apikey } }
    )

    if (!resp.ok) {
      return NextResponse.json({ error: 'Leaderboard not found' }, { status: 404 })
    }

    const data = await resp.json()
    const result = {
      act: data.actId,
      total: data.totalPlayers,
      region,
      players: data.players?.map((p: { puuid: string; gameName: string; tagLine: string; leaderboardRank: number; rankedRating: number; numberOfWins: number }) => ({
        rank: p.leaderboardRank,
        name: p.gameName,
        tag: p.tagLine,
        rr: p.rankedRating,
        wins: p.numberOfWins,
      })),
    }

    cache.set(key, { data: result, time: Date.now() })
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
  } catch {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 })
  }
}

