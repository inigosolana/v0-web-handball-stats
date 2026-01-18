"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, Calendar, RefreshCw, AlertCircle } from "lucide-react"
import { getMatch, getMatchEvents, getFullStats, type Match, type Event, type Player } from "@/app/actions/sevenmetrics"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function MatchDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const matchId = params.id as string

    const [match, setMatch] = useState<Match | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [matchData, eventsData, statsData] = await Promise.all([
                getMatch(matchId),
                getMatchEvents(matchId),
                getFullStats(matchId),
            ])
            setMatch(matchData)
            setEvents(eventsData)
            setStats(statsData)
        } catch (err) {
            setError("Error cargando los detalles del partido.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (matchId) {
            fetchData()
        }
    }, [matchId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    if (error || !match) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-xl font-medium">{error || "Partido no encontrado"}</p>
                <Button onClick={() => router.back()}>Volver</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="hover:bg-transparent pl-0 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Partidos
            </Button>

            {/* Header / Scoreboard */}
            <Card className="bg-gradient-to-br from-card to-muted/20 border-border">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left">
                            <div className="text-3xl font-bold mb-2">{match.team_a_name}</div>
                            <Badge variant="outline" className="text-xs">Local</Badge>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="text-5xl font-black flex items-center gap-4 text-foreground">
                                <span>{match.local_score}</span>
                                <span className="text-muted-foreground/30 font-light">-</span>
                                <span>{match.visitor_score}</span>
                            </div>
                            <Badge variant={match.status === "IN_PROGRESS" ? "default" : "secondary"} className="mt-4 text-sm px-3 py-1">
                                {match.status === "IN_PROGRESS" ? "EN JUEGO" : match.status === "FINISHED" ? "FINALIZADO" : match.status}
                            </Badge>
                            <div className="flex items-center mt-3 text-sm text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-full">
                                <Clock className="h-3.5 w-3.5 mr-2" />
                                {Math.floor(match.total_time_seconds / 60)}:{(match.total_time_seconds % 60).toString().padStart(2, "0")}
                            </div>
                        </div>

                        <div className="text-center md:text-right">
                            <div className="text-3xl font-bold mb-2">{match.team_b_name}</div>
                            <Badge variant="outline" className="text-xs">Visitante</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="events">Eventos</TabsTrigger>
                    <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Línea de Tiempo</CardTitle>
                            <CardDescription>Registro de acciones del partido</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {events.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No hay eventos registrados</div>
                            ) : (
                                <div className="space-y-4">
                                    {events.slice().reverse().map((event) => (
                                        <div key={event.id} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                                            <div className="w-16 font-mono text-sm text-muted-foreground font-medium text-right">
                                                {event.time_formatted}
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${event.team === "A" ? "bg-blue-500" : "bg-red-500"}`} />
                                            <div className="flex-1">
                                                <span className="font-bold text-foreground">{event.action}</span>
                                                <span className="text-muted-foreground mx-2">•</span>
                                                <span className="text-sm">Jugador #{event.player}</span>
                                            </div>
                                            <Badge variant="outline" className="ml-auto text-[10px] w-8 justify-center">
                                                {event.team}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stats" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas Generales</CardTitle>
                            <CardDescription>Resumen del rendimiento de equipos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Basic Stats Table Placeholder - The stats object structure depends on backend implementation.
                     For now we display raw JSON if available, or a friendly message if empty.
                 */}
                            {stats && Object.keys(stats).length > 0 ? (
                                <div className="rounded-md border p-4 bg-muted/10 font-mono text-sm overflow-auto max-h-96">
                                    <pre>{JSON.stringify(stats, null, 2)}</pre>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay estadísticas calculadas disponibles.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
