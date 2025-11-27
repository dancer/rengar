import { NextResponse } from 'next/server'

interface ExampleCache {
  mmr: unknown
  stats: unknown
  time: number
}

let examplecache: ExampleCache | null = null
const CACHE_TTL = 24 * 60 * 60 * 1000

const TESTNAME = 'my melody'
const TESTTAG = 'aaa'

export async function GET(request: Request) {
  const now = Date.now()
  const url = new URL(request.url)
  const base = `${url.protocol}//${url.host}`

  if (examplecache && now - examplecache.time < CACHE_TTL) {
    return NextResponse.json({
      mmr: examplecache.mmr,
      stats: examplecache.stats,
      cached: true,
    })
  }

  try {
    const [mmrres, statsres] = await Promise.all([
      fetch(`${base}/api/mmr/${encodeURIComponent(TESTNAME)}/${TESTTAG}`),
      fetch(`${base}/api/stats/${encodeURIComponent(TESTNAME)}/${TESTTAG}`),
    ])

    const mmr = await mmrres.json()
    const stats = await statsres.json()

    examplecache = { mmr, stats, time: now }

    return NextResponse.json({
      mmr,
      stats,
      cached: false,
    })
  } catch {
    return NextResponse.json({
      mmr: null,
      stats: null,
      cached: false,
    })
  }
}

