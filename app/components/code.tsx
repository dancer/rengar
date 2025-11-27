'use client'

import { useState } from 'react'

function Copy({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const copy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <button
            onClick={copy}
            className="absolute right-2 top-2 rounded border border-[#333] px-2 py-1 text-[9px] uppercase tracking-wider text-[#666] transition-colors hover:border-[#555] hover:text-[#999]"
        >
            {copied ? 'copied' : 'copy'}
        </button>
    )
}

export function Code({ children, lang }: { children: string; lang?: string }) {
    return (
        <div className="group relative rounded border border-[#d4d2c8] bg-black">
            <Copy text={children} />
            {lang && (
                <div className="border-b border-[#222] px-4 py-2 text-[9px] uppercase tracking-wider text-[#555]">
                    {lang}
                </div>
            )}
            <pre className="overflow-x-auto px-4 py-3 text-[11px] leading-relaxed text-[#e5e5e5]">
                {children}
            </pre>
        </div>
    )
}

