"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClub } from "@/contexts/club-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, XCircle, AlertTriangle, Trophy, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PlayerStats {
  playerId: string
  playerName: string
  goals: number
  misses: number
  turnovers: number
}

export default function MatchPage() {
  const router = useRouter()
  const { teams, getPlayersByTeam, addMatch } = useClub()

  // Estado del partido
  const [matchStarted, setMatchStarted] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState("")
  const [rivalName, setRivalName] = useState("")
  const [teamScore, setTeamScore] = useState(0)
  const [rivalScore, setRivalScore] = useState(0)
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])

  const selectedTeamData = teams.find((t) => t.id === selectedTeam)
  const teamPlayers = selectedTeam ? getPlayersByTeam(selectedTeam) : []

  const handleStartMatch = () => {
    if (!selectedTeam || !rivalName.trim()) {
      alert("Por favor selecciona tu equipo y escribe el nombre del rival")
      return
    }

    if (teamPlayers.length === 0) {
      alert("Este equipo no tiene jugadores. Añade jugadores desde la sección Plantilla primero.")
      return
    }

    // Inicializar estadísticas de jugadores
    const initialStats: PlayerStats[] = teamPlayers.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      goals: 0,
      misses: 0,
      turnovers: 0,
    }))

    setPlayerStats(initialStats)
    setMatchStarted(true)
  }

  const handleAction = (playerId: string, action: "goal" | "miss" | "turnover") => {
    setPlayerStats((prev) =>
      prev.map((stat) => {
        if (stat.playerId === playerId) {
          if (action === "goal") {
            setTeamScore((s) => s + 1)
            return { ...stat, goals: stat.goals + 1 }
          } else if (action === "miss") {
            return { ...stat, misses: stat.misses + 1 }
          } else {
            return { ...stat, turnovers: stat.turnovers + 1 }
          }
        }
        return stat
      }),
    )
  }

  const handleRivalGoal = () => {
    setRivalScore((s) => s + 1)
  }

  const handleFinishMatch = () => {
    if (!confirm("¿Finalizar y guardar el partido?")) {
      return
    }

    const match = {
      id: Date.now().toString(),
      date: new Date(),
      teamId: selectedTeam,
      teamName: selectedTeamData?.name || "",
      rival: rivalName,
      teamScore,
      rivalScore,
      stats: playerStats,
    }

    addMatch(match)
    alert("¡Partido guardado exitosamente!")
    router.push("/dashboard")
  }

  // Vista de configuración pre-partido
  if (!matchStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modo Partido</h1>
          <p className="text-muted-foreground">Configura el partido antes de comenzar</p>
        </div>

        <Card className="mx-auto max-w-2xl bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">¿Quién juega hoy?</CardTitle>
            <CardDescription className="text-muted-foreground">Selecciona tu equipo y el rival</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="team" className="text-card-foreground">
                Equipo Local (Tu Equipo)
              </Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger id="team" className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecciona tu equipo" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} - {team.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeam && (
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground mb-2">Jugadores disponibles:</p>
                <p className="text-lg font-bold text-primary">{teamPlayers.length} jugadores</p>
                {teamPlayers.length === 0 && (
                  <p className="mt-2 text-sm text-destructive">
                    Este equipo no tiene jugadores. Añade jugadores desde la sección Plantilla.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rival" className="text-card-foreground">
                Equipo Rival
              </Label>
              <Input
                id="rival"
                value={rivalName}
                onChange={(e) => setRivalName(e.target.value)}
                placeholder="Ej: BM Ciudad Real"
                className="bg-background border-border text-foreground"
              />
            </div>

            <Button
              onClick={handleStartMatch}
              disabled={!selectedTeam || !rivalName.trim() || teamPlayers.length === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
            >
              <Trophy className="mr-2 h-5 w-5" />
              COMENZAR PARTIDO
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Vista de partido en vivo
  return (
    <div className="space-y-6 pb-8">
      {/* Header con marcador */}
      <div className="sticky top-0 z-10 rounded-xl border border-border bg-card/95 backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm("¿Cancelar partido? Los datos no se guardarán")) {
                setMatchStarted(false)
                setTeamScore(0)
                setRivalScore(0)
              }
            }}
            className="text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">
            EN VIVO
          </Badge>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="text-center flex-1">
            <div className="text-5xl font-bold text-primary mb-2">{teamScore}</div>
            <div className="text-sm text-card-foreground font-medium">{selectedTeamData?.name}</div>
          </div>
          <div className="text-3xl font-bold text-muted-foreground">-</div>
          <div className="text-center flex-1">
            <div className="text-5xl font-bold text-foreground mb-2">{rivalScore}</div>
            <div className="text-sm text-card-foreground font-medium">{rivalName}</div>
          </div>
        </div>

        <Button
          onClick={handleRivalGoal}
          variant="outline"
          className="w-full mt-4 border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
        >
          <Target className="mr-2 h-4 w-4" />
          Gol del Rival
        </Button>
      </div>

      {/* Lista de jugadores con acciones */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Registrar Acciones</h2>
        {playerStats.map((stat) => {
          const player = teamPlayers.find((p) => p.id === stat.playerId)
          return (
            <Card key={stat.playerId} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">{stat.playerName}</h3>
                      <p className="text-sm text-muted-foreground">
                        #{player?.number} - {player?.position}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{stat.goals}</div>
                      <div className="text-xs text-muted-foreground">goles</div>
                    </div>
                  </div>

                  {/* Estadísticas actuales */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Fallos: {stat.misses}</span>
                    <span>Pérdidas: {stat.turnovers}</span>
                  </div>
                </div>

                {/* Botones de acción grandes para táctil */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleAction(stat.playerId, "goal")}
                    className="h-16 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    GOL
                  </Button>
                  <Button
                    onClick={() => handleAction(stat.playerId, "miss")}
                    variant="outline"
                    className="h-16 border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    FALLO
                  </Button>
                  <Button
                    onClick={() => handleAction(stat.playerId, "turnover")}
                    variant="outline"
                    className="h-16 border-muted-foreground text-muted-foreground hover:bg-muted bg-transparent"
                  >
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    PÉRDIDA
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botón para finalizar partido */}
      <div className="sticky bottom-0 pt-4 pb-4">
        <Button
          onClick={handleFinishMatch}
          className="w-full h-16 bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg font-bold"
        >
          FINALIZAR Y GUARDAR
        </Button>
      </div>
    </div>
  )
}
