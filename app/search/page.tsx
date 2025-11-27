'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MmrData {
  name: string
  tag: string
  puuid?: string
  region?: string
  rank?: string
  rr?: number
  card?: string
  error?: string
}

interface StatsData {
  name: string
  tag: string
  puuid?: string
  region?: string
  matches?: number
  kills?: number
  deaths?: number
  assists?: number
  kd?: string
  acs?: number
  adr?: number
  error?: string
}

function Stat({ value, label, large }: { value: string | number | undefined; label: string; large?: boolean }) {
  return (
    <div className="text-center">
      <div className={`font-light text-black ${large ? 'text-3xl' : 'text-xl'}`}>
        {value ?? '-'}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#7b7a72]">
        {label}
      </div>
    </div>
  )
}

export default function Search() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mmr, setMmr] = useState<MmrData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)

  const search = async () => {
    const parts = input.split('#')
    if (parts.length !== 2) return

    const [name, tag] = parts
    setLoading(true)
    setMmr(null)
    setStats(null)

    try {
      const [mmrRes, statsRes] = await Promise.all([
        fetch(`/api/mmr/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`),
        fetch(`/api/stats/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`),
      ])

      const mmrData = await mmrRes.json()
      const statsData = await statsRes.json()

      setMmr(mmrData)
      setStats(statsData)
    } catch {
      setMmr({ error: 'failed to fetch', name: '', tag: '' })
    } finally {
      setLoading(false)
    }
  }

  const hasResults = mmr && !mmr.error

  return (
    <div className="min-h-screen bg-[#e6e5dd] text-black">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6 text-[11px]">
        <Link href="/" className="font-medium uppercase tracking-[0.3em] text-[#7b7a72] hover:text-black">
          rengar
        </Link>
        <div className="flex items-center gap-5 text-[#a3a39a]">
          <Link href="/docs" className="hover:text-black">
            docs
          </Link>
          <a href="https://github.com/dancer/rengar" className="hover:text-black">
            github
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 pb-12">
        <div className="mb-10 flex items-end gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="username#tag"
              className="w-full border-b border-[#d4d2c8] bg-transparent py-3 text-lg text-black outline-none transition-colors placeholder:text-[#c4c3bb] focus:border-black"
            />
          </div>
          <button
            onClick={search}
            disabled={loading || !input.includes('#')}
            className="px-4 py-3 text-[11px] uppercase tracking-[0.15em] text-[#7b7a72] transition-colors hover:text-black disabled:text-[#c4c3bb]"
          >
            {loading ? '...' : 'search'}
          </button>
        </div>

        {hasResults && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[#d4d2c8] bg-white">
              {mmr.card && (
                <img
                  src={`https://media.valorant-api.com/playercards/${mmr.card}/wideart.png`}
                  alt=""
                  className="h-auto w-full"
                />
              )}
              {!mmr.card && (
                <div className="aspect-[452/128] w-full bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]" />
              )}

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-light tracking-wide text-black">
                      {mmr.name}
                      <span className="text-[#a3a39a]">#{mmr.tag}</span>
                    </h2>
                    {mmr.region && (
                      <div className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-[#a3a39a]">
                        {mmr.region}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-light text-black">{mmr.rank}</div>
                  </div>
                </div>
              </div>
            </div>

            {stats && !stats.error && (
              <div className="overflow-hidden rounded-2xl border border-[#d4d2c8] bg-white">
                <div className="flex items-center justify-between px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-[#a3a39a]">
                  <span>current act</span>
                  <span>{stats.matches} matches</span>
                </div>

                <div className="grid grid-cols-3 border-t border-[#d4d2c8] py-5">
                  <Stat value={stats.kd} label="kd" large />
                  <Stat value={stats.acs} label="acs" large />
                  <Stat value={stats.adr} label="adr" large />
                </div>

                <div className="grid grid-cols-3 border-t border-[#d4d2c8] py-5">
                  <Stat value={stats.kills} label="kills" />
                  <Stat value={stats.deaths} label="deaths" />
                  <Stat value={stats.assists} label="assists" />
                </div>
              </div>
            )}
          </div>
        )}

        {(mmr?.error || stats?.error) && (
          <div className="rounded-2xl border border-[#d4d2c8] bg-white p-8 text-center text-sm text-[#7b7a72]">
            {mmr?.error || stats?.error}
          </div>
        )}

        {!mmr && !stats && !loading && (
          <div className="py-24 text-center text-[11px] uppercase tracking-[0.15em] text-[#a3a39a]">
            enter a riot id to search
          </div>
        )}
      </main>
    </div>
  )
}
