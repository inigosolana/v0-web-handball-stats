"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoalView } from "@/components/match/goal-view"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trophy, PlayCircle } from "lucide-react"
import { VideoSmartPlayer } from "@/components/match/video-smart-player"

export default function MatchDetailPage() {
    const params = useParams()
    const { matches } = useClub()
    const matchId = params.id as string

    // Find match in context (later this will fetch from DB)
    const match = matches.find(m => m.id === matchId)

    if (!match) {
        return <div className="p-8 text-center text-muted-foreground">Partido no encontrado</div>
    }

    // Simulate transforming match stats to "Shots" for the GoalView
    // In real app, we would fetch 'match_events' where type='shot'
    const mockShots = match.stats.flatMap(stat =>
        stat.shotZones?.map((zone, idx) => ({
            id: `${stat.playerId}-${idx}`,
            x: zone.x,
            y: zone.y,
            result: zone.result as "goal" | "miss",
            playerNumber: parseInt(stat.playerId), // Mock number logic
        })) || []
    )

    const localShots = mockShots.filter((_, i) => i % 2 === 0) // Mock split
    const visitorShots = mockShots.filter((_, i) => i % 2 !== 0) // Mock split

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-3 bg-gradient-to-r from-background to-muted/20 border-border">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                            {/* Local Team */}
                            <div className="text-center flex-1">
                                <h2 className="text-2xl font-bold text-primary">{match.teamName}</h2>
                                <div className="text-6xl font-black tracking-tighter text-foreground mt-2">{match.teamScore}</div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-col items-center gap-2 px-8 py-2 bg-background/50 rounded-xl backdrop-blur-sm border border-border/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{match.date.toLocaleDateString()}</span>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">FINALIZADO</Badge>
                            </div>

                            {/* Visitor Team */}
                            <div className="text-center flex-1">
                                <h2 className="text-2xl font-bold text-muted-foreground">{match.rival}</h2>
                                <div className="text-6xl font-black tracking-tighter text-muted-foreground mt-2">{match.rivalScore}</div>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                    <TabsTrigger value="visuals">Visualización</TabsTrigger>
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="events">Eventos</TabsTrigger>
                </TabsList>

                {/* Tab: Stats Table */}
                <TabsContent value="stats" className="space-y-4">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle>Rendimiento Individual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jugador</TableHead>
                                        <TableHead className="text-center">Goles</TableHead>
                                        <TableHead className="text-center">Fallos</TableHead>
                                        <TableHead className="text-center">Efectividad</TableHead>
                                        <TableHead className="text-center">Pérdidas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {match.stats.map((stat) => {
                                        const totalShots = stat.goals + stat.misses;
                                        const accuracy = totalShots > 0 ? Math.round((stat.goals / totalShots) * 100) : 0;
                                        return (
                                            <TableRow key={stat.playerId}>
                                                <TableCell className="font-medium">{stat.playerName}</TableCell>
                                                <TableCell className="text-center text-green-500 font-bold">{stat.goals}</TableCell>
                                                <TableCell className="text-center text-red-400">{stat.misses}</TableCell>
                                                <TableCell className="text-center font-bold">{accuracy}%</TableCell>
                                                <TableCell className="text-center text-muted-foreground">{stat.turnovers}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Visuals (Goal View) */}
                <TabsContent value="visuals" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Tiros Realizados (Local)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GoalView shots={localShots} />
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-destructive" />
                                    Tiros Recibidos (Visitante)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GoalView shots={visitorShots} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Video */}
                <TabsContent value="video" className="space-y-4">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-primary" />
                                Video del Partido (Auto-Clip)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Mock video URL for demo purposes - in real app would match.videoUrl */}
                            <VideoSmartPlayer
                                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                events={mockShots.map(s => ({
                                    id: s.id,
                                    time: Math.floor(Math.random() * 600), // Random mock time
                                    label: `${s.result === 'goal' ? 'GOL' : 'FALLO'} - Jugador #${s.playerNumber}`
                                }))}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Events (Timeline placeholder) */}
                <TabsContent value="events">
                    <Card className="border-border">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>La línea de tiempo de eventos estará disponible pronto.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}

// Helper icon component
function Target({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
