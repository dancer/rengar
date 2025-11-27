import { NextResponse } from 'next/server'

const cache = new Map<string, { data: unknown; time: number }>()
const matchcache = new Map<string, { data: unknown; time: number }>()
const regioncache = new Map<string, string>()
const CACHE_TTL = 5 * 60 * 1000
const MATCH_CACHE_TTL = 60 * 60 * 1000

const REGIONS = ['eu', 'na', 'ap', 'kr']

const TIER_NAMES: Record<number, string> = {
  0: 'Unranked',
  3: 'Iron 1', 4: 'Iron 2', 5: 'Iron 3',
  6: 'Bronze 1', 7: 'Bronze 2', 8: 'Bronze 3',
  9: 'Silver 1', 10: 'Silver 2', 11: 'Silver 3',
  12: 'Gold 1', 13: 'Gold 2', 14: 'Gold 3',
  15: 'Platinum 1', 16: 'Platinum 2', 17: 'Platinum 3',
  18: 'Diamond 1', 19: 'Diamond 2', 20: 'Diamond 3',
  21: 'Ascendant 1', 22: 'Ascendant 2', 23: 'Ascendant 3',
  24: 'Immortal 1', 25: 'Immortal 2', 26: 'Immortal 3',
  27: 'Radiant',
}

async function findregion(puuid: string, apikey: string): Promise<string | null> {
  const cached = regioncache.get(puuid)
  if (cached) return cached

  const results = await Promise.all(
    REGIONS.map(async (region) => {
      const resp = await fetch(
        `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
        { headers: { 'X-Riot-Token': apikey } }
      )
      if (resp.ok) {
        const data = await resp.json()
        if (data.history && data.history.length > 0) {
          return { region, data }
        }
      }
      return null
    })
  )

  const found = results.find(r => r !== null)
  if (found) {
    regioncache.set(puuid, found.region)
    matchcache.set(`matchlist:${puuid}`, { data: found.data, time: Date.now() })
    return found.region
  }
  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string; tag: string }> }
) {
  const { name, tag } = await params
  
  const key = `mmr:${name}:${tag}`
  const cached = cache.get(key)
  
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT' }
    })
  }
  
  const apikey = process.env.RIOT_API_KEY
  if (!apikey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }
  
  try {
    const accountresp = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      { headers: { 'X-Riot-Token': apikey } }
    )
    
    if (!accountresp.ok) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }
    
    const account = await accountresp.json()
    const puuid = account.puuid
    
    const region = await findregion(puuid, apikey)
    
    if (!region) {
      return NextResponse.json({
        name: account.gameName,
        tag: account.tagLine,
        puuid,
        region: null,
        rank: 'Unranked',
        rr: 0,
        card: null,
      })
    }
    
    const matchcachekey = `matchlist:${puuid}`
    let matchlist = matchcache.get(matchcachekey)?.data as { history?: { matchId: string; queueId: string }[] } | null
    
    if (!matchlist || Date.now() - (matchcache.get(matchcachekey)?.time || 0) > MATCH_CACHE_TTL) {
      const matchresp = await fetch(
        `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
        { headers: { 'X-Riot-Token': apikey } }
      )
      if (matchresp.ok) {
        matchlist = await matchresp.json()
        matchcache.set(matchcachekey, { data: matchlist, time: Date.now() })
      }
    }
    
    let rank = 'Unranked'
    let rr = 0
    let card = null
    
    const compmatch = matchlist?.history?.find(m => m.queueId === 'competitive')
    
    if (compmatch) {
      const matchid = compmatch.matchId
      const matchdetailkey = `match:${matchid}`
      let match = matchcache.get(matchdetailkey)?.data as {
        players?: { puuid: string; playerCard?: string; competitiveTier?: number }[]
      } | null
      
      if (!match) {
        const matchdetail = await fetch(
          `https://${region}.api.riotgames.com/val/match/v1/matches/${matchid}`,
          { headers: { 'X-Riot-Token': apikey } }
        )
        if (matchdetail.ok) {
          match = await matchdetail.json()
          matchcache.set(matchdetailkey, { data: match, time: Date.now() })
        }
      }
      
      if (match) {
        const player = match.players?.find((p) => p.puuid === puuid)
        if (player) {
          if (player.competitiveTier !== undefined) {
            rank = TIER_NAMES[player.competitiveTier] || 'Unranked'
          }
          if (player.playerCard) {
            card = player.playerCard
          }
        }
      }
    }
    
    const result = {
      name: account.gameName,
      tag: account.tagLine,
      puuid,
      region,
      rank,
      rr,
      card,
    }
    
    cache.set(key, { data: result, time: Date.now() })
    
    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS' }
    })
  } catch (e) {
    console.error(`[rengar] mmr:`, e)
    return NextResponse.json({ error: 'API request failed', details: String(e) }, { status: 500 })
  }
}
