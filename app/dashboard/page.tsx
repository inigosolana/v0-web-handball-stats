"use client"

import { useRouter } from "next/navigation"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Lock, Trophy, User } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { currentUser, getAccessibleTeams, getPlayersByTeam, getMatchesByTeam, canEditTeam } = useClub()
  const accessibleTeams = getAccessibleTeams()

  const handleTeamClick = (teamId: string) => {
    router.push(`/dashboard/team/${teamId}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mis Equipos</h1>
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
              className="group relative bg-[#0A0A0A] border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden p-2"
              onClick={() => handleTeamClick(team.id)}
            >
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-muted-foreground bg-white/5 px-2 py-1 rounded-md text-xs font-medium">
                <User className="h-3.5 w-3.5" />
                <span>{teamPlayers.length}</span>
              </div>

              <CardHeader className="pb-2 pt-6">
                <div className="mb-4 inline-flex">
                  <Shield className="h-12 w-12 text-primary" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {team.name}
                </CardTitle>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {team.category}
                </p>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-sm text-muted-foreground">Jugadores:</span>
                    <span className="font-bold text-white">{teamPlayers.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-sm text-muted-foreground">Partidos:</span>
                    <span className="font-bold text-white">{teamMatches.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Victorias:</span>
                    <span className="font-bold text-primary">{wins}</span>
                  </div>

                  {!canEdit && currentUser?.role === "coach" && (
                    <div className="pt-2 flex justify-end">
                      <Lock className="h-4 w-4 text-muted-foreground/50" />
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
