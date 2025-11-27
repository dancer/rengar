'use client'

import { Status } from './status'

interface Section {
    id: string
    label: string
}

interface SidebarProps {
    sections: Section[]
}

export function Sidebar({ sections }: SidebarProps) {
    return (
        <aside className="hidden w-36 shrink-0 lg:block">
            <div className="fixed top-24 flex w-36 flex-col justify-between" style={{ height: 'calc(100vh - 8rem)' }}>
                <nav className="space-y-1 text-[11px]">
                    {sections.map((s) => (
                        <a
                            key={s.id}
                            href={`#${s.id}`}
                            className="block py-1.5 text-[#7b7a72] transition-colors hover:text-black"
                        >
                            {s.label}
                        </a>
                    ))}
                </nav>
                <div className="border-t border-[#d4d2c8] pt-4 text-[11px]">
                    <div className="mb-2 text-[10px] uppercase tracking-wider text-[#a3a39a]">
                        status
                    </div>
                    <Status />
                </div>
            </div>
        </aside>
    )
}

