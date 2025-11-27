'use client'

import { Code } from './code'

interface Param {
    name: string
    type: string
    desc: string
}

interface EndpointProps {
    method: string
    path: string
    desc: string
    params: Param[]
    response: string
}

export function Endpoint({ method, path, desc, params, response }: EndpointProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="rounded border border-[#d4d2c8] px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    {method}
                </span>
                <code className="text-[12px] text-black">{path}</code>
            </div>
            <p className="text-[12px] text-[#7b7a72]">{desc}</p>
            <div className="space-y-0">
                {params.map((p) => (
                    <div key={p.name} className="flex items-baseline justify-between border-t border-[#d4d2c8] py-2 text-[11px]">
                        <div className="flex items-baseline gap-2">
                            <span className="text-black">{p.name}</span>
                            <span className="text-[10px] text-[#a3a39a]">{p.type}</span>
                        </div>
                        <span className="text-[#7b7a72]">{p.desc}</span>
                    </div>
                ))}
            </div>
            <Code lang="response">{response}</Code>
        </div>
    )
}

