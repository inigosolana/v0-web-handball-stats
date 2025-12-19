"use client"

import { useRouter } from "next/navigation"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Lock } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { currentUser, getAccessibleTeams, getPlayersByTeam, getMatchesByTeam, canEditTeam } = useClub()
  const accessibleTeams = getAccessibleTeams()

  const handleTeamClick = (teamId: string) => {
    router.push(`/dashboard/team/${teamId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis Equipos</h1>
        <p className="text-muted-foreground">
          {currentUser?.role === "superadmin" && "Todos los equipos del sistema"}
          {currentUser?.role === "coach" && "Equipos de tu club"}
          {currentUser?.role === "player" && "Equipos de tu club"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accessibleTeams.map((team) => {
          const teamPlayers = getPlayersByTeam(team.id)
          const teamMatches = getMatchesByTeam(team.id)
          const wins = teamMatches.filter((m) => m.teamScore > m.rivalScore).length
          const canEdit = canEditTeam(team.id)

          return (
            <Card
              key={team.id}
              className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10"
              onClick={() => handleTeamClick(team.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-10 w-10 text-primary" />
                  <div className="flex items-center gap-2">
                    {!canEdit && currentUser?.role === "coach" && (
                      <Lock className="h-4 w-4 text-muted-foreground" title="Solo lectura" />
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {teamPlayers.length}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-card-foreground text-xl">{team.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{team.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jugadores:</span>
                    <span className="font-medium text-card-foreground">{teamPlayers.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Partidos:</span>
                    <span className="font-medium text-card-foreground">{teamMatches.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Victorias:</span>
                    <span className="font-medium text-primary">{wins}</span>
                  </div>
                  {!canEdit && currentUser?.role === "coach" && (
                    <div className="mt-4 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Modo observador
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
