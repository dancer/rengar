import { NextResponse } from 'next/server'

const cache = new Map<string, { data: unknown; time: number }>()
const CACHE_TTL = 60 * 60 * 1000

const REGIONS = ['eu', 'na', 'ap', 'kr']

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(request.url)
  const region = url.searchParams.get('region')

  const key = `match:${id}`
  const cached = cache.get(key)

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
  }

  const apikey = process.env.RIOT_API_KEY
  if (!apikey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const regionsToTry = region ? [region] : REGIONS

    for (const r of regionsToTry) {
      const resp = await fetch(
        `https://${r}.api.riotgames.com/val/match/v1/matches/${id}`,
        { headers: { 'X-Riot-Token': apikey } }
      )

      if (resp.ok) {
        const data = await resp.json()
        const result = {
          id: data.matchInfo?.matchId,
          map: data.matchInfo?.mapId,
          mode: data.matchInfo?.queueId,
          started: data.matchInfo?.gameStartMillis,
          length: data.matchInfo?.gameLengthMillis,
          region: r,
          players: data.players?.map((p: { puuid: string; gameName: string; tagLine: string; teamId: string; characterId: string; stats: { kills: number; deaths: number; assists: number; score: number } }) => ({
            puuid: p.puuid,
            name: p.gameName,
            tag: p.tagLine,
            team: p.teamId,
            agent: p.characterId,
            kills: p.stats?.kills,
            deaths: p.stats?.deaths,
            assists: p.stats?.assists,
            score: p.stats?.score,
          })),
          teams: data.teams?.map((t: { teamId: string; won: boolean; roundsWon: number; roundsPlayed: number }) => ({
            id: t.teamId,
            won: t.won,
            rounds: t.roundsWon,
            total: t.roundsPlayed,
          })),
        }

        cache.set(key, { data: result, time: Date.now() })
        return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
      }
    }

    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 })
  }
}

