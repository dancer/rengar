'use client'

import { useState, useEffect } from 'react'
import { Code, Endpoint, Header, Sidebar } from '../components'

const sections = [
  { id: 'overview', label: 'overview' },
  { id: 'mmr', label: 'mmr' },
  { id: 'rank', label: 'rank' },
  { id: 'stats', label: 'stats' },
  { id: 'account', label: 'account' },
  { id: 'matches', label: 'matches' },
  { id: 'match', label: 'match' },
  { id: 'leaderboard', label: 'leaderboard' },
  { id: 'content', label: 'content' },
  { id: 'valstatus', label: 'val status' },
  { id: 'twitch', label: 'twitch' },
  { id: 'discord', label: 'discord' },
  { id: 'obs', label: 'obs' },
  { id: 'errors', label: 'errors' },
]

const FALLBACK_MMR = `{
  "name": "my melody",
  "tag": "aaa",
  "region": "eu",
  "rank": "Ascendant 3",
  "card": "adb00c74-4505-4e29-e359-74adfc0ead87"
}`

const FALLBACK_STATS = `{
  "name": "my melody",
  "tag": "aaa",
  "region": "eu",
  "matches": 24,
  "kills": 486,
  "deaths": 312,
  "assists": 102,
  "kd": "1.56",
  "acs": 284,
  "adr": 198
}`

export default function Docs() {
  const [mmrex, setMmrex] = useState(FALLBACK_MMR)
  const [statsex, setStatsex] = useState(FALLBACK_STATS)

  useEffect(() => {
    fetch('/api/example')
      .then((r) => r.json())
      .then((d) => {
        if (d.mmr && !d.mmr.error) {
          setMmrex(JSON.stringify(d.mmr, null, 2))
        }
        if (d.stats && !d.stats.error) {
          setStatsex(JSON.stringify(d.stats, null, 2))
        }
      })
      .catch(() => { })
  }, [])

  return (
    <div className="min-h-screen bg-[#e6e5dd] text-black">
      <Header current="docs" />

      <div className="mx-auto flex max-w-5xl gap-12 px-6 py-12">
        <Sidebar sections={sections} />

        <main className="min-w-0 flex-1 space-y-16">
          <section id="overview">
            <div className="mb-8 inline-block rounded-t-[30px] rounded-b-[10px] bg-black px-8 py-6 text-[#f5f5f5]">
              <div className="flex items-center justify-between gap-16 text-[10px] font-semibold uppercase tracking-[0.28em]">
                <span>rengar</span>
                <span>api docs</span>
              </div>
              <div className="mt-5 text-2xl font-light tracking-[0.2em]">
                DOCUMENTATION
              </div>
            </div>
            <p className="max-w-lg text-[12px] leading-relaxed text-[#7b7a72]">
              valorant api with 9 endpoints. no auth required, json responses.
              built for twitch bots, discord commands, and stream overlays.
            </p>
            <div className="mt-6 space-y-2 text-[11px]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#a3a39a]">base url</div>
              <Code>https://reng.ar/api</Code>
            </div>
          </section>

          <section id="mmr" className="scroll-mt-24">
            <div className="mb-6 text-[10px] uppercase tracking-[0.25em] text-[#a3a39a]">
              player endpoints
            </div>
            <h2 className="mb-6 text-lg font-light tracking-wide">mmr</h2>
            <Endpoint
              method="GET"
              path="/api/mmr/{name}/{tag}"
              desc="returns the current competitive rank for a player. region is auto-detected."
              params={[
                { name: 'name', type: 'string', desc: 'riot id name' },
                { name: 'tag', type: 'string', desc: 'riot id tagline' },
              ]}
              response={mmrex}
            />
          </section>

          <section id="rank" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">rank</h2>
            <Endpoint
              method="GET"
              path="/api/rank/{name}/{tag}"
              desc="returns plain text rank for twitch bot commands. no json parsing needed."
              params={[
                { name: 'name', type: 'string', desc: 'riot id name' },
                { name: 'tag', type: 'string', desc: 'riot id tagline' },
              ]}
              response={`my melody#aaa is Ascendant 3`}
            />
          </section>

          <section id="stats" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">stats</h2>
            <Endpoint
              method="GET"
              path="/api/stats/{name}/{tag}"
              desc="returns current act stats: kd, acs, adr and totals from ranked games. region is auto-detected."
              params={[
                { name: 'name', type: 'string', desc: 'riot id name' },
                { name: 'tag', type: 'string', desc: 'riot id tagline' },
              ]}
              response={statsex}
            />
          </section>

          <section id="account" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">account</h2>
            <Endpoint
              method="GET"
              path="/api/account/{name}/{tag}"
              desc="returns the puuid and account info for a player."
              params={[
                { name: 'name', type: 'string', desc: 'riot id name' },
                { name: 'tag', type: 'string', desc: 'riot id tagline' },
              ]}
              response={`{
  "puuid": "abc123...",
  "name": "my melody",
  "tag": "aaa"
}`}
            />
          </section>

          <section id="matches" className="scroll-mt-24">
            <div className="mb-6 text-[10px] uppercase tracking-[0.25em] text-[#a3a39a]">
              match endpoints
            </div>
            <h2 className="mb-6 text-lg font-light tracking-wide">matches</h2>
            <Endpoint
              method="GET"
              path="/api/matches/{name}/{tag}"
              desc="returns the last 20 matches for a player. region is auto-detected."
              params={[
                { name: 'name', type: 'string', desc: 'riot id name' },
                { name: 'tag', type: 'string', desc: 'riot id tagline' },
              ]}
              response={`{
  "name": "my melody",
  "tag": "aaa",
  "puuid": "abc123...",
  "region": "eu",
  "matches": [
    {
      "id": "match-uuid",
      "started": 1700000000000,
      "queue": "competitive"
    }
  ]
}`}
            />
          </section>

          <section id="match" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">match</h2>
            <Endpoint
              method="GET"
              path="/api/match/{id}"
              desc="returns full match details including all players and teams."
              params={[
                { name: 'id', type: 'string', desc: 'match id' },
                { name: 'region', type: 'query', desc: 'optional, auto-detected' },
              ]}
              response={`{
  "id": "match-uuid",
  "map": "Ascent",
  "mode": "competitive",
  "started": 1700000000000,
  "length": 2400000,
  "region": "eu",
  "players": [
    {
      "puuid": "abc123...",
      "name": "my melody",
      "tag": "aaa",
      "team": "Blue",
      "agent": "Jett",
      "kills": 25,
      "deaths": 15,
      "assists": 5,
      "score": 6200
    }
  ],
  "teams": [
    {
      "id": "Blue",
      "won": true,
      "rounds": 13,
      "total": 24
    }
  ]
}`}
            />
          </section>

          <section id="leaderboard" className="scroll-mt-24">
            <div className="mb-6 text-[10px] uppercase tracking-[0.25em] text-[#a3a39a]">
              game data
            </div>
            <h2 className="mb-6 text-lg font-light tracking-wide">leaderboard</h2>
            <Endpoint
              method="GET"
              path="/api/leaderboard/{actId}"
              desc="returns the ranked leaderboard for an act."
              params={[
                { name: 'actId', type: 'string', desc: 'act uuid' },
                { name: 'region', type: 'query', desc: 'eu, na, ap, kr (default: eu)' },
                { name: 'size', type: 'query', desc: 'results per page (max 200)' },
                { name: 'start', type: 'query', desc: 'start index' },
              ]}
              response={`{
  "act": "act-uuid",
  "total": 50000,
  "region": "eu",
  "players": [
    {
      "rank": 1,
      "name": "Player",
      "tag": "0001",
      "rr": 850,
      "wins": 120
    }
  ]
}`}
            />
          </section>

          <section id="content" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">content</h2>
            <Endpoint
              method="GET"
              path="/api/content"
              desc="returns game content: active acts, agents, maps, and modes."
              params={[
                { name: 'region', type: 'query', desc: 'eu, na, ap, kr (default: eu)' },
              ]}
              response={`{
  "version": "08.00.00.123456",
  "acts": [
    { "id": "act-uuid", "name": "Episode 8 Act 1", "type": "act" }
  ],
  "agents": [
    { "id": "agent-uuid", "name": "Jett" }
  ],
  "maps": [
    { "id": "map-uuid", "name": "Ascent" }
  ],
  "modes": [
    { "id": "competitive", "name": "Competitive" }
  ]
}`}
            />
          </section>

          <section id="valstatus" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">valorant status</h2>
            <Endpoint
              method="GET"
              path="/api/status/valorant"
              desc="returns valorant server status, maintenances, and incidents."
              params={[
                { name: 'region', type: 'query', desc: 'eu, na, ap, kr (default: eu)' },
              ]}
              response={`{
  "id": "eu",
  "name": "Europe",
  "region": "eu",
  "maintenances": [],
  "incidents": []
}`}
            />
          </section>

          <section id="twitch" className="scroll-mt-24">
            <div className="mb-6 text-[10px] uppercase tracking-[0.25em] text-[#a3a39a]">
              integrations
            </div>
            <h2 className="mb-6 text-lg font-light tracking-wide">twitch</h2>
            <p className="mb-6 text-[12px] text-[#7b7a72]">
              use rengar in streamelements or nightbot chat commands. the /rank endpoint returns plain text for easy bot integration.
            </p>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-wider text-[#a3a39a]">
                  streamelements
                </div>
                <Code>{`!cmd add rank $(urlfetch https://reng.ar/api/rank/YOUR_NAME/YOUR_TAG)

output: my melody#aaa is Ascendant 3`}</Code>
              </div>
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-wider text-[#a3a39a]">
                  nightbot
                </div>
                <Code>{`!addcom !rank $(urlfetch https://reng.ar/api/rank/YOUR_NAME/YOUR_TAG)`}</Code>
              </div>
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-wider text-[#a3a39a]">
                  json (advanced)
                </div>
                <Code>{`$(urlfetch json https://reng.ar/api/mmr/YOUR_NAME/YOUR_TAG).rank`}</Code>
              </div>
            </div>
          </section>

          <section id="discord" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">discord</h2>
            <p className="mb-6 text-[12px] text-[#7b7a72]">
              example discord.js command that returns rank.
            </p>
            <Code lang="javascript">{`client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!rank')) return;

  const [name, tag] = message.content
    .split(' ')[1]?.split('#') || [];

  if (!name || !tag) {
    return message.reply('usage: !rank Name#Tag');
  }

  const res = await fetch(
    \`https://reng.ar/api/mmr/\${name}/\${tag}\`
  );
  const data = await res.json();

  message.reply(data.rank);
});`}</Code>
          </section>

          <section id="obs" className="scroll-mt-24">
            <h2 className="mb-6 text-lg font-light tracking-wide">obs overlay</h2>
            <p className="mb-6 text-[12px] text-[#7b7a72]">
              add as a browser source. updates every 60 seconds.
            </p>
            <Code lang="html">{`<div id="rank" style="font-family: monospace; color: white;"></div>
<script>
async function update() {
  const res = await fetch(
    'https://reng.ar/api/mmr/YOUR_NAME/YOUR_TAG'
  );
  const d = await res.json();
  document.getElementById('rank').textContent = d.rank;
}
update();
setInterval(update, 60000);
</script>`}</Code>
          </section>

          <section id="errors" className="scroll-mt-24">
            <div className="mb-6 text-[10px] uppercase tracking-[0.25em] text-[#a3a39a]">
              reference
            </div>
            <h2 className="mb-6 text-lg font-light tracking-wide">errors</h2>
            <div className="space-y-0 text-[11px]">
              <div className="flex justify-between border-t border-[#d4d2c8] py-2">
                <span className="text-black">200</span>
                <span className="text-[#7b7a72]">success</span>
              </div>
              <div className="flex justify-between border-t border-[#d4d2c8] py-2">
                <span className="text-black">404</span>
                <span className="text-[#7b7a72]">player not found</span>
              </div>
              <div className="flex justify-between border-t border-[#d4d2c8] py-2">
                <span className="text-black">429</span>
                <span className="text-[#7b7a72]">rate limited</span>
              </div>
              <div className="flex justify-between border-t border-[#d4d2c8] py-2">
                <span className="text-black">500</span>
                <span className="text-[#7b7a72]">server error</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
