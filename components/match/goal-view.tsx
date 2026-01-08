"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

interface Shot {
    id: string
    x: number // 0-100%
    y: number // 0-100%
    result: "goal" | "miss" | "save" | "post"
    playerId?: string
    playerNumber?: number
}

interface GoalViewProps {
    shots: Shot[]
    title?: string
}

export function GoalView({ shots, title }: GoalViewProps) {
    // Filter shots that are within the goal frame roughly
    // We assume x=0-100 represents the full width, y=0-100 full height of the goal plane

    return (
        <div className="w-full">
            {title && <h3 className="text-lg font-bold mb-4 text-center">{title}</h3>}
            <div className="relative aspect-[3/2] w-full bg-slate-900 rounded-lg p-8 border border-slate-800">
                {/* Goal Frame SVG */}
                <svg
                    viewBox="0 0 300 200"
                    className="w-full h-full drop-shadow-2xl"
                    style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.1))" }}
                >
                    {/* Posts and Crossbar */}
                    <path
                        d="M 20 180 L 20 20 L 280 20 L 280 180"
                        fill="none"
                        stroke="#f8fafc"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Net (simplified pattern) */}
                    <pattern id="netPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 20" stroke="#334155" strokeWidth="1" fill="none" opacity="0.5" />
                        <path d="M 0 0 L 20 20" stroke="#334155" strokeWidth="1" fill="none" opacity="0.5" />
                    </pattern>
                    <rect x="24" y="24" width="252" height="156" fill="url(#netPattern)" />

                    {/* Render Shots */}
                    {shots.map((shot) => (
                        <motion.circle
                            key={shot.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            cx={20 + (shot.x / 100) * 260} // Map 0-100 to 20-280 (inside posts)
                            cy={20 + (shot.y / 100) * 160} // Map 0-100 to 20-180 (inside posts)
                            r="6"
                            fill={shot.result === "goal" ? "#22c55e" : shot.result === "miss" ? "#ef4444" : "#eab308"}
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80"
                        >
                            <title>{`Player #${shot.playerNumber || '?'} - ${shot.result}`}</title>
                        </motion.circle>
                    ))}
                </svg>

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                        <span className="text-white">Gol</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></div>
                        <span className="text-white">Parada/Poste</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
                        <span className="text-white">Fuera</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
