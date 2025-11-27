import { NextResponse } from 'next/server'

interface StatusCache {
  status: string
  time: number
  mmr: boolean
  stats: boolean
  account: boolean
  matches: boolean
  match: boolean
  leaderboard: boolean
  content: boolean
  valstatus: boolean
}

let statuscache: StatusCache | null = null
const CACHE_TTL = 24 * 60 * 60 * 1000

const TESTNAME = 'my melody'
const TESTTAG = 'aaa'

export async function GET(request: Request) {
  const now = Date.now()
  const url = new URL(request.url)
  const base = `${url.protocol}//${url.host}`

  if (statuscache && now - statuscache.time < CACHE_TTL) {
    return NextResponse.json({
      status: statuscache.status,
      mmr: statuscache.mmr,
      stats: statuscache.stats,
      account: statuscache.account,
      matches: statuscache.matches,
      match: statuscache.match,
      leaderboard: statuscache.leaderboard,
      content: statuscache.content,
      valstatus: statuscache.valstatus,
      checked: statuscache.time,
      cached: true,
    })
  }

  const apikey = process.env.RIOT_API_KEY
  if (!apikey) {
    statuscache = {
      status: 'offline',
      time: now,
      mmr: false,
      stats: false,
      account: false,
      matches: false,
      match: false,
      leaderboard: false,
      content: false,
      valstatus: false,
    }
    return NextResponse.json({ ...statuscache, checked: now, cached: false })
  }

  try {
    const encodedname = encodeURIComponent(TESTNAME)

    const [mmrres, statsres, accountres, matchesres, contentres, valstatusres] = await Promise.all([
      fetch(`${base}/api/mmr/${encodedname}/${TESTTAG}`).then(r => r.ok).catch(() => false),
      fetch(`${base}/api/stats/${encodedname}/${TESTTAG}`).then(r => r.ok).catch(() => false),
      fetch(`${base}/api/account/${encodedname}/${TESTTAG}`).then(r => r.ok).catch(() => false),
      fetch(`${base}/api/matches/${encodedname}/${TESTTAG}`).then(r => r.ok).catch(() => false),
      fetch(`${base}/api/content`).then(r => r.ok).catch(() => false),
      fetch(`${base}/api/status/valorant`).then(r => r.ok).catch(() => false),
    ])

    const allok = mmrres && statsres && accountres && matchesres && contentres && valstatusres

    statuscache = {
      status: allok ? 'online' : 'offline',
      time: now,
      mmr: mmrres,
      stats: statsres,
      account: accountres,
      matches: matchesres,
      match: true,
      leaderboard: true,
      content: contentres,
      valstatus: valstatusres,
    }

    return NextResponse.json({
      ...statuscache,
      checked: now,
      cached: false,
    })
  } catch {
    statuscache = {
      status: 'offline',
      time: now,
      mmr: false,
      stats: false,
      account: false,
      matches: false,
      match: false,
      leaderboard: false,
      content: false,
      valstatus: false,
    }
    return NextResponse.json({ ...statuscache, checked: now, cached: false })
  }
}
