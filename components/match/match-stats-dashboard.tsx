"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { VideoAction } from "./video-studio-layout" // Assuming shared type

interface MatchStatsDashboardProps {
    actions: VideoAction[]
    homeName?: string
    awayName?: string
}

export function MatchStatsDashboard({ actions, homeName = "Home", awayName = "Away" }: MatchStatsDashboardProps) {

    // Advanced Stats Logic
    const stats = useMemo(() => {
        const calculateTeamStats = (teamId: string) => {
            const teamActions = actions.filter(a => a.teamId === teamId)

            // Basic Counts
            const goals = teamActions.filter(a => a.eventType === 'goal').length
            const misses = teamActions.filter(a => a.eventType === 'miss').length
            const saves = teamActions.filter(a => a.eventType === 'save').length // Saves made AGAINST this team? No, usually 'save' event is recorded for the defensive team or offensive?
            // Convention: Action 'save' usually means the GOALKEEPER made a save.
            // If we tag by "Team that did the action":
            // Home Goal -> Home Team Attack
            // Home Save -> Home Team Goalkeeper (Defense)

            // Let's assume 'teamId' in action is the team who performed it.
            // So 'Home Save' means Home GK saved it.
            // But 'Home Goal' means Home Attack scored.

            // Possession calculation is tricky without strictly defined sequences.
            // Approx Possession = Goals + Misses + (Opponent Saves) + Turnovers

            // We need to know Opponent ID to find Opponent Saves
            const opponentId = teamId === 'home' ? 'away' : 'home'
            const opponentSaves = actions.filter(a => a.teamId === opponentId && a.eventType === 'save').length

            const turnovers = teamActions.filter(a => a.eventType === 'turnover').length
            const shots = goals + misses + opponentSaves
            const possessions = shots + turnovers

            // Efficiency
            const effPc = possessions > 0 ? (goals / possessions) * 100 : 0
            const shootingEffPc = shots > 0 ? (goals / shots) * 100 : 0
            const lostBallsPc = possessions > 0 ? (turnovers / possessions) * 100 : 0

            // Positional Attack Stats
            // Filter actions that have phase='positional'
            // We need to count possessions that were 'positional'
            // This is hard if we only tag the END result.
            // Assumption: The action tag applies to the phase.
            const positionalActions = teamActions.filter(a => a.phase === 'positional')
            const positionalGoals = positionalActions.filter(a => a.eventType === 'goal').length
            const positionalShots = positionalActions.filter(a => ['goal', 'miss'].includes(a.eventType)).length +
                actions.filter(a => a.teamId === opponentId && a.eventType === 'save' && a.phase === 'positional').length
            // Note: Opponent save might not have the phase tag of the attacker unless we carry it over.
            // Simplified: Just use Attacker's actions for phase stats if possible.
            // If 'save' is tagged with 'positional', it means the SHOT was positional.

            const positionalTurnovers = positionalActions.filter(a => a.eventType === 'turnover').length
            const positionalPossessions = positionalShots + positionalTurnovers
            const offensePositionalPc = possessions > 0 ? (positionalPossessions / possessions) * 100 : 0 // % of total possessions that are positional? Or efficiency? User image says "Offense Positional %" and "21/41". Likely Efficiency of Positional.
            const positionalEff = positionalPossessions > 0 ? (positionalGoals / positionalPossessions) * 100 : 0

            // Fastbreak
            const fastbreakActions = teamActions.filter(a => a.phase === 'fastbreak')
            const fastbreakGoals = fastbreakActions.filter(a => a.eventType === 'goal').length
            const fastbreakPossessions = fastbreakActions.length // Simplified
            const fastbreakEff = fastbreakPossessions > 0 ? (fastbreakGoals / fastbreakPossessions) * 100 : 0

            return {
                possessions,
                goals,
                shots,
                effPc,
                shootingEffPc,
                lostBallsPc,
                positionalEff,
                positionalPossessions,
                positionalGoals,
                fastbreakEff,
                fastbreakPossessions,
                fastbreakGoals
            }
        }

        return {
            home: calculateTeamStats('home'),
            away: calculateTeamStats('away')
        }
    }, [actions])

    // Helper for Stat Row (Center aligned comparison)
    const StatRow = ({ label, homeValue, awayValue, homeLabel, awayLabel, unit = "" }: any) => (
        <div className="grid grid-cols-[1fr_120px_1fr] md:grid-cols-[1fr_200px_1fr] items-center gap-4 py-2 border-b last:border-0 border-muted/40">
            {/* Home Side */}
            <div className="flex items-center justify-end gap-3">
                <span className="text-xs text-muted-foreground font-mono">{homeLabel}</span>
                <span className="font-bold text-sm w-12 text-right">{homeValue.toFixed(0)}{unit}</span>
                <Progress value={homeValue} className="w-24 h-2 rotate-180 bg-muted/30 [&>div]:bg-blue-600" />
            </div>

            {/* Label Center */}
            <div className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {label}
            </div>

            {/* Away Side */}
            <div className="flex items-center justify-start gap-3">
                <Progress value={awayValue} className="w-24 h-2 bg-muted/30 [&>div]:bg-teal-500" />
                <span className="font-bold text-sm w-12 text-left">{awayValue.toFixed(0)}{unit}</span>
                <span className="text-xs text-muted-foreground font-mono">{awayLabel}</span>
            </div>
        </div>
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Scoreboard */}
            <div className="flex items-center justify-between bg-card border rounded-xl p-6 shadow-sm">
                <div className="text-center w-1/3">
                    <h2 className="text-2xl font-black text-blue-700 uppercase">{homeName}</h2>
                    <div className="text-4xl font-bold mt-2">{stats.home.goals}</div>
                </div>
                <div className="text-center w-1/3 space-y-2">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Total Possessions</div>
                    <div className="flex justify-center gap-8 font-mono font-bold text-xl">
                        <span className="text-blue-600">{stats.home.possessions}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-teal-600">{stats.away.possessions}</span>
                    </div>
                </div>
                <div className="text-center w-1/3">
                    <h2 className="text-2xl font-black text-teal-600 uppercase">{awayName}</h2>
                    <div className="text-4xl font-bold mt-2">{stats.away.goals}</div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Detailed Comparison Table */}
                <Card className="lg:col-span-2 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/20 border-b">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-center">Efficiency Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-4 space-y-1">
                            <StatRow
                                label="Global Efficiency"
                                homeValue={stats.home.effPc}
                                awayValue={stats.away.effPc}
                                homeLabel={`${stats.home.goals}/${stats.home.possessions}`}
                                awayLabel={`${stats.away.goals}/${stats.away.possessions}`}
                                unit="%"
                            />
                            <StatRow
                                label="Shooting Eff"
                                homeValue={stats.home.shootingEffPc}
                                awayValue={stats.away.shootingEffPc}
                                homeLabel={`${stats.home.goals}/${stats.home.shots}`}
                                awayLabel={`${stats.away.goals}/${stats.away.shots}`}
                                unit="%"
                            />
                            <StatRow
                                label="Lost Balls"
                                homeValue={stats.home.lostBallsPc}
                                awayValue={stats.away.lostBallsPc}
                                homeLabel={`${(stats.home.possessions * stats.home.lostBallsPc / 100).toFixed(0)}/${stats.home.possessions}`}
                                awayLabel={`${(stats.away.possessions * stats.away.lostBallsPc / 100).toFixed(0)}/${stats.away.possessions}`}
                                unit="%"
                            />
                            <StatRow
                                label="Positional Attack"
                                homeValue={stats.home.positionalEff}
                                awayValue={stats.away.positionalEff}
                                homeLabel={`${stats.home.positionalGoals}/${stats.home.positionalPossessions}`}
                                awayLabel={`${stats.away.positionalGoals}/${stats.away.positionalPossessions}`}
                                unit="%"
                            />
                            <StatRow
                                label="Fastbreak"
                                homeValue={stats.home.fastbreakEff}
                                awayValue={stats.away.fastbreakEff}
                                homeLabel={`${stats.home.fastbreakGoals}/${stats.home.fastbreakPossessions}`}
                                awayLabel={`${stats.away.fastbreakGoals}/${stats.away.fastbreakPossessions}`}
                                unit="%"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Visual Map / Placeholder */}
                <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-900 to-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Advanced Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-4">
                        <div className="w-full h-full border-2 border-white/10 rounded-lg flex items-center justify-center bg-white/5 relative group">
                            <span className="text-xs text-white/50 uppercase">Connection Map & Goal Distribution</span>
                            {/* Placeholder for future heatmap */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                            <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-teal-400 rounded-full animate-pulse delay-75" />
                        </div>
                        <p className="text-xs text-blue-200">
                            Spatial analysis and pass maps will be generated here based on tagged coordinates.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
