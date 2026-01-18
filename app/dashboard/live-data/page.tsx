"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar, Clock, Trophy, AlertCircle } from "lucide-react"
import { getMatches, type Match } from "@/app/actions/sevenmetrics"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ExternalAppPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMatches()
      setMatches(data)
    } catch (err) {
      setError("No se pudieron cargar los partidos. Verifica que la API esté activa.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "default" // Primary color
      case "FINISHED":
        return "secondary" // Gray/Secondary
      case "PAUSED":
        return "destructive" // Red-ish/Orange
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "EN JUEGO"
      case "FINISHED":
        return "FINALIZADO"
      case "PAUSED":
        return "PAUSADO"
      case "SETUP":
        return "CONFIGURACIÓN"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Datos en Directo (Botonera)</h1>
          <p className="text-muted-foreground">Monitorización en tiempo real de partidos conectados</p>
        </div>
        <Button variant="outline" onClick={fetchMatches} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {loading && matches.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 && !error ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium text-foreground">No hay partidos activos</h3>
          <p className="text-muted-foreground">Los partidos creados en la app de botonera aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="group cursor-pointer hover:border-primary/50 transition-all duration-200 overflow-hidden"
              onClick={() => router.push(`/dashboard/live-data/${match.id}`)}
            >
              <CardHeader className="pb-3 bg-muted/40 border-b border-border/50">
                <div className="flex justify-between items-start">
                  <Badge variant={getStatusColor(match.status) as any} className="font-bold">
                    {getStatusLabel(match.status)}
                  </Badge>
                  {match.total_time_seconds > 0 && (
                    <div className="flex items-center text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-sm border">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(match.total_time_seconds / 60)}:
                      {(match.total_time_seconds % 60).toString().padStart(2, "0")}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center w-1/3">
                    <div className="font-bold text-lg leading-tight mb-1 truncate" title={match.team_a_name}>
                      {match.team_a_name}
                    </div>
                    <div className="text-4xl font-black text-primary">{match.local_score}</div>
                  </div>
                  <div className="text-muted-foreground font-bold text-xs">VS</div>
                  <div className="text-center w-1/3">
                    <div className="font-bold text-lg leading-tight mb-1 truncate" title={match.team_b_name}>
                      {match.team_b_name}
                    </div>
                    <div className="text-4xl font-black text-primary">{match.visitor_score}</div>
                  </div>
                </div>

                <div className="flex items-center text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {format(new Date(match.created_at), "PPP p", { locale: es })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
