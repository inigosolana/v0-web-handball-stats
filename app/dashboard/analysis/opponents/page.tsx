"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function OpponentAnalysisPage() {
    const { matches } = useClub()

    // Extract unique rivals
    const rivals = Array.from(new Set(matches.map(m => m.rival))).sort()
    const [selectedRival, setSelectedRival] = useState<string>(rivals[0] || "")

    // Filter matches involving this rival
    const rivalMatches = matches.filter(m => m.rival === selectedRival)

    // Aggregate Stats
    const totalMatches = rivalMatches.length
    const totalGoalsScored = rivalMatches.reduce((acc, m) => acc + m.teamScore, 0)
    const totalGoalsConceded = rivalMatches.reduce((acc, m) => acc + m.rivalScore, 0)
    const avgGoalsScored = totalMatches ? (totalGoalsScored / totalMatches).toFixed(1) : 0

    // Wins/Losses
    const wins = rivalMatches.filter(m => m.teamScore > m.rivalScore).length
    const draws = rivalMatches.filter(m => m.teamScore === m.rivalScore).length
    const losses = rivalMatches.filter(m => m.teamScore < m.rivalScore).length

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Análisis de Rivales</h1>
                    <p className="text-muted-foreground">Estudio estadístico de equipos contrarios</p>
                </div>
                <Select value={selectedRival} onValueChange={setSelectedRival}>
                    <SelectTrigger className="w-full sm:w-[250px] bg-card border-border">
                        <SelectValue placeholder="Seleccionar Rival" />
                    </SelectTrigger>
                    <SelectContent>
                        {rivals.map(rival => (
                            <SelectItem key={rival} value={rival}>{rival}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedRival && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Partidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMatches}</div>
                            <p className="text-xs text-muted-foreground">
                                {wins}V - {draws}E - {losses}D
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Goles a Favor (Media)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{avgGoalsScored}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Goles en Contra (Media)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{(totalGoalsConceded / totalMatches).toFixed(1)}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {selectedRival && (
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Historial de Resultados</CardTitle>
                        <CardDescription>Evolución de marcador contra {selectedRival}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rivalMatches.map(m => ({
                                date: m.date.toLocaleDateString(),
                                Favor: m.teamScore,
                                Contra: m.rivalScore
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Bar dataKey="Favor" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Contra" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
