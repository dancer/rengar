import Link from 'next/link'

interface HeaderProps {
    current?: string
}

export function Header({ current }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-[#d4d2c8] bg-[#e6e5dd]/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-[11px]">
                <Link href="/" className="font-semibold uppercase tracking-[0.35em] text-black">
                    rengar
                </Link>
                <nav className="flex items-center gap-6 text-[#7b7a72]">
                    <Link href="/docs" className={current === 'docs' ? 'text-black' : 'hover:text-black'}>
                        docs
                    </Link>
                    <a href="https://github.com/dancer/rengar" className="hover:text-black">
                        github
                    </a>
                </nav>
            </div>
        </header>
    )
}

