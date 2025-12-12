import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e6e5dd] text-black">
      <header className="pt-8">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 text-[11px] text-[#7b7a72]">
          <span className="font-semibold uppercase tracking-[0.35em]">
            rengar
          </span>
          <nav className="flex items-center gap-5">
            <Link href="/docs" className="hover:text-black">
              docs
            </Link>
            <a href="https://github.com/dancer/rengar" className="hover:text-black">
              github
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center px-6 py-20">
        <section className="w-full max-w-3xl space-y-8">
          <div className="relative mx-auto max-w-xl rounded-t-[36px] rounded-b-[10px] bg-black px-8 py-11 text-[#f5f5f5]">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em]">
              <span>rengar</span>
              <span>valorant api</span>
            </div>
            <div className="mt-9 text-3xl font-semibold tracking-[0.32em] md:text-4xl">
              RANK
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-[0.32em] md:text-4xl">
              STATS
            </div>
            <div className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[#d4d4d4]">
              analogue data in a digital ranked world
            </div>
          </div>

          <div className="mx-auto flex max-w-xl items-start justify-between text-[10px] uppercase tracking-[0.22em] text-[#7b7a72]">
            <div className="space-y-2">
              <div>free</div>
              <div>valorant</div>
              <div>api</div>
            </div>
            <div className="space-y-2 text-right">
              <div>mmr</div>
              <div>act stats</div>
              <div>for bots</div>
            </div>
        </div>
        </section>
      </main>
    </div>
  )
}
