import { NextResponse } from 'next/server'

const cache = new Map<string, { data: unknown; time: number }>()
const matchcache = new Map<string, { data: unknown; time: number }>()
const regioncache = new Map<string, string>()
const CACHE_TTL = 10 * 60 * 1000
const MATCH_CACHE_TTL = 60 * 60 * 1000

const REGIONS = ['eu', 'na', 'ap', 'kr']

async function fetchmatch(region: string, matchid: string, apikey: string) {
  const cachekey = `match:${matchid}`
  const cached = matchcache.get(cachekey)
  if (cached && Date.now() - cached.time < MATCH_CACHE_TTL) {
    return cached.data
  }
  
  const resp = await fetch(
    `https://${region}.api.riotgames.com/val/match/v1/matches/${matchid}`,
    { headers: { 'X-Riot-Token': apikey } }
  )
  
  if (!resp.ok) return null
  
  const data = await resp.json()
  matchcache.set(cachekey, { data, time: Date.now() })
  return data
}

async function findregion(puuid: string, apikey: string): Promise<{ region: string; matchlist: unknown } | null> {
  const cachedregion = regioncache.get(puuid)
  if (cachedregion) {
    const matchcachekey = `matchlist:${puuid}`
    const cachedlist = matchcache.get(matchcachekey)
    if (cachedlist && Date.now() - cachedlist.time < MATCH_CACHE_TTL) {
      return { region: cachedregion, matchlist: cachedlist.data }
    }
    
    const resp = await fetch(
      `https://${cachedregion}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': apikey } }
    )
    if (resp.ok) {
      const data = await resp.json()
      matchcache.set(matchcachekey, { data, time: Date.now() })
      return { region: cachedregion, matchlist: data }
    }
  }

  const results = await Promise.all(
    REGIONS.map(async (region) => {
      const resp = await fetch(
        `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
        { headers: { 'X-Riot-Token': apikey } }
      )
      if (resp.ok) {
        const data = await resp.json()
        if (data.history && data.history.length > 0) {
          return { region, matchlist: data }
        }
      }
      return null
    })
  )

  const found = results.find(r => r !== null)
  if (found) {
    regioncache.set(puuid, found.region)
    matchcache.set(`matchlist:${puuid}`, { data: found.matchlist, time: Date.now() })
    return found
  }
  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string; tag: string }> }
) {
  const { name, tag } = await params
  
  const key = `stats:${name}:${tag}`
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
    
    const regiondata = await findregion(puuid, apikey)
    
    if (!regiondata) {
      return NextResponse.json({
        name: account.gameName,
        tag: account.tagLine,
        puuid,
        region: null,
        matches: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        kd: '0.00',
        acs: 0,
        adr: 0,
      })
    }
    
    const { region, matchlist } = regiondata
    const history = (matchlist as { history?: { matchId: string; queueId: string }[] }).history || []
    const compmatches = history.filter((m) => m.queueId === 'competitive')
    const matchids = compmatches.map((m) => m.matchId)
    
    const batchsize = 5
    const batches = []
    for (let i = 0; i < matchids.length; i += batchsize) {
      batches.push(matchids.slice(i, i + batchsize))
    }
    
    let kills = 0, deaths = 0, assists = 0, score = 0, rounds = 0
    let matches = 0
    let currentseason: string | null = null
    
    for (const batch of batches) {
      const results = await Promise.all(
        batch.map((id: string) => fetchmatch(region, id, apikey))
      )
      
      for (const match of results) {
        if (!match) continue
        
        if (!currentseason && match.matchInfo?.seasonId) {
          currentseason = match.matchInfo.seasonId
        }
        
        if (currentseason && match.matchInfo?.seasonId !== currentseason) {
          continue
        }
        
        const player = match.players?.find((p: { puuid: string }) => p.puuid === puuid)
        if (!player?.stats) continue
        
        kills += player.stats.kills || 0
        deaths += player.stats.deaths || 0
        assists += player.stats.assists || 0
        score += player.stats.score || 0
        rounds += player.stats.roundsPlayed || 0
        matches++
      }
    }
    
    const result = {
      name: account.gameName,
      tag: account.tagLine,
      puuid,
      region,
      matches,
      kills,
      deaths,
      assists,
      kd: deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2),
      acs: rounds > 0 ? Math.round(score / rounds) : 0,
      adr: rounds > 0 ? Math.round((score * 0.7) / rounds) : 0,
    }
    
    cache.set(key, { data: result, time: Date.now() })
    
    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS' }
    })
  } catch (e) {
    console.error(`[rengar] stats:`, e)
    return NextResponse.json({ error: 'API request failed', details: String(e) }, { status: 500 })
  }
}
