"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  const { teams, getMatchesByTeam } = useClub()
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id || "")

  const teamMatches = getMatchesByTeam(selectedTeam).sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Historial de Partidos</h1>
          <p className="text-muted-foreground">Todos los partidos registrados</p>
        </div>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-full sm:w-[200px] bg-card border-border">
            <SelectValue placeholder="Seleccionar equipo" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {teamMatches.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay partidos registrados para este equipo</p>
            </CardContent>
          </Card>
        ) : (
          teamMatches.map((match) => {
            const result =
              match.teamScore > match.rivalScore
                ? "Victoria"
                : match.teamScore < match.rivalScore
                  ? "Derrota"
                  : "Empate"
            const resultColor =
              result === "Victoria"
                ? "bg-primary/20 text-primary border-primary/50"
                : result === "Derrota"
                  ? "bg-destructive/20 text-destructive border-destructive/50"
                  : "bg-secondary/20 text-secondary border-secondary/50"

            return (
              <Card key={match.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-card-foreground">
                        {match.teamName} vs {match.rival}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {match.date.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={resultColor}>
                      {result}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Marcador */}
                    <div className="flex items-center justify-center gap-8 rounded-lg bg-muted/50 py-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{match.teamScore}</div>
                        <div className="text-sm text-muted-foreground">{match.teamName}</div>
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground">-</div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">{match.rivalScore}</div>
                        <div className="text-sm text-muted-foreground">{match.rival}</div>
                      </div>
                    </div>

                    {/* Estadísticas de jugadores */}
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-card-foreground flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Goleadores
                      </h4>
                      <div className="space-y-2">
                        {match.stats
                          .sort((a, b) => b.goals - a.goals)
                          .slice(0, 5)
                          .map((stat) => (
                            <div
                              key={stat.playerId}
                              className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                            >
                              <span className="text-sm text-card-foreground">{stat.playerName}</span>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-primary font-bold">{stat.goals} goles</span>
                                <span className="text-muted-foreground">{stat.misses} fallos</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
