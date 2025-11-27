'use client'

import { useState, useEffect } from 'react'

interface StatusData {
    status: 'online' | 'offline'
    mmr: boolean
    stats: boolean
    account: boolean
    matches: boolean
    match: boolean
    leaderboard: boolean
    content: boolean
    valstatus: boolean
    checked: number
    cached: boolean
}

export function Status() {
    const [data, setData] = useState<StatusData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/status')
            .then((r) => r.json())
            .then((d) => {
                setData(d)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const ago = data?.checked ? Math.floor((Date.now() - data.checked) / 1000 / 60 / 60) : 0

    if (loading) {
        return (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#a3a39a]" />
                    <span className="text-[#7b7a72]">checking</span>
                </div>
            </div>
        )
    }

    const online = data?.status === 'online'

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[#7b7a72]">{online ? 'online' : 'offline'}</span>
            </div>
            {data?.checked && ago > 0 && (
                <div className="text-[10px] text-[#a3a39a]">{ago}h ago</div>
            )}
        </div>
    )
}

