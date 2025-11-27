import { NextResponse } from 'next/server'

const cache = new Map<string, { data: unknown; time: number }>()
const regioncache = new Map<string, { data: string; time: number }>()
const CACHE_TTL = 5 * 60 * 1000
const REGION_CACHE_TTL = 24 * 60 * 60 * 1000

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string; tag: string }> }
) {
  const { name, tag } = await params
  const key = `matches:${name}:${tag}`
  const cached = cache.get(key)

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
  }

  const apikey = process.env.RIOT_API_KEY
  if (!apikey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const accountresp = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers: { 'X-Riot-Token': apikey } }
    )

    if (!accountresp.ok) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const account = await accountresp.json()
    const puuid = account.puuid

    let region: string | null = null
    const regionkey = `region:${puuid}`
    const cachedregion = regioncache.get(regionkey)

    if (cachedregion && Date.now() - cachedregion.time < REGION_CACHE_TTL) {
      region = cachedregion.data
    } else {
      const regions = ['eu', 'na', 'ap', 'kr']
      const promises = regions.map(r =>
        fetch(`https://${r}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`, { headers: { 'X-Riot-Token': apikey } })
          .then(res => res.ok ? res.json().then(data => ({ region: r, data })) : null)
          .catch(() => null)
      )

      const results = await Promise.all(promises)
      for (const res of results) {
        if (res?.data?.history?.length > 0) {
          region = res.region
          regioncache.set(regionkey, { data: region, time: Date.now() })
          break
        }
      }
    }

    if (!region) {
      return NextResponse.json({ error: 'No match history found' }, { status: 404 })
    }

    const matchresp = await fetch(
      `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': apikey } }
    )

    if (!matchresp.ok) {
      return NextResponse.json({ error: 'Match history not available' }, { status: matchresp.status })
    }

    const matchlist = await matchresp.json()
    const result = {
      name: account.gameName,
      tag: account.tagLine,
      puuid,
      region,
      matches: matchlist.history?.slice(0, 20).map((m: { matchId: string; gameStartTimeMillis: number; queueId: string }) => ({
        id: m.matchId,
        started: m.gameStartTimeMillis,
        queue: m.queueId,
      })),
    }

    cache.set(key, { data: result, time: Date.now() })
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
  } catch {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 })
  }
}

