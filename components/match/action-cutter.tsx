"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Scissors, Save, PlayCircle, Goal, Shield, Users } from "lucide-react"

interface ActionCutterProps {
    currentTime: number
    onSeek: (time: number) => void
    onSave: (action: any) => void
}

const EVENT_TYPES = [
    { value: "goal", label: "Goal" },
    { value: "save", label: "Save" },
    { value: "miss", label: "Miss" },
    { value: "turnover", label: "Turnover" },
    { value: "steal", label: "Steal" },
    { value: "7m_goal", label: "7m Goal" },
    { value: "7m_miss", label: "7m Miss" },
]

export function ActionCutter({ currentTime, onSeek, onSave }: ActionCutterProps) {
    const [startTime, setStartTime] = useState<number | null>(null)
    const [endTime, setEndTime] = useState<number | null>(null)
    const [team, setTeam] = useState<string>("home")
    const [eventType, setEventType] = useState<string>("goal")
    const [playerNumber, setPlayerNumber] = useState<string>("")
    const [tags, setTags] = useState<string>("")
    const [phase, setPhase] = useState<string>("positional")
    const [state, setState] = useState<string>("6v6")

    const PHASES = [
        { value: "positional", label: "Positional Attack" },
        { value: "fastbreak", label: "Fastbreak" },
        { value: "counter", label: "Counter Attack" },
        { value: "7m", label: "7 Meters" },
    ]

    const STATES = [
        { value: "6v6", label: "Equality (6v6)" },
        { value: "6v5", label: "Superiority (6v5)" },
        { value: "5v6", label: "Inferiority (5v6)" },
    ]

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleSetStart = () => setStartTime(currentTime)
    const handleSetEnd = () => setEndTime(currentTime)

    const handleSave = () => {
        if (startTime === null || endTime === null) return

        const action = {
            startTime,
            endTime,
            teamId: team,
            eventType,
            playerId: playerNumber,
            tags: tags.split(",").map(t => t.trim()).filter(Boolean),
            time_seconds: startTime, // Legacy support
            phase,
            state
        }

        onSave(action)

        // Reset (keep team maybe?)
        setStartTime(null)
        setEndTime(null)
        // setEventType("goal") // Keep last event type for speed?
        setPlayerNumber("")
        setTags("")
    }

    return (
        <Card className="w-full h-full border-l rounded-none">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Scissors className="w-5 h-5 text-primary" />
                    Action Cutter
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Visual Timeline / Clipper */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center p-2 border rounded bg-muted/50 w-24">
                            <Label className="text-xs mb-1">Start (In)</Label>
                            <span className="font-mono font-bold text-lg">
                                {startTime !== null ? formatTime(startTime) : "--:--"}
                            </span>
                            <Button
                                size="sm"
                                variant={startTime !== null ? "default" : "outline"}
                                className="w-full mt-2 h-7 text-xs"
                                onClick={handleSetStart}
                            >
                                Set In
                            </Button>
                        </div>

                        <div className="flex-1 flex justify-center text-muted-foreground">
                            {startTime !== null && endTime !== null ? (
                                <span className="text-xs">Duration: {(endTime - startTime).toFixed(1)}s</span>
                            ) : (
                                <span className="text-xs">...</span>
                            )}
                        </div>

                        <div className="flex flex-col items-center p-2 border rounded bg-muted/50 w-24">
                            <Label className="text-xs mb-1">End (Out)</Label>
                            <span className="font-mono font-bold text-lg">
                                {endTime !== null ? formatTime(endTime) : "--:--"}
                            </span>
                            <Button
                                size="sm"
                                variant={endTime !== null ? "default" : "outline"}
                                className="w-full mt-2 h-7 text-xs"
                                onClick={handleSetEnd}
                            >
                                Set Out
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Team</Label>
                            <Select value={team} onValueChange={setTeam}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="home">Home (Local)</SelectItem>
                                    <SelectItem value="away">Away (Visit)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Player #</Label>
                            <Input
                                placeholder="Number"
                                value={playerNumber}
                                onChange={(e) => setPlayerNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Select value={eventType} onValueChange={setEventType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phase</Label>
                            <Select value={phase} onValueChange={setPhase}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PHASES.map(p => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <Select value={state} onValueChange={setState}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATES.map(s => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tags (comma separated)</Label>
                        <Input
                            placeholder="e.g. fastbreak, wing"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>
                </div>

                <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleSave}
                    disabled={startTime === null || endTime === null}
                >
                    <Save className="w-4 h-4" />
                    Save Action
                </Button>

            </CardContent>
        </Card>
    )
}
