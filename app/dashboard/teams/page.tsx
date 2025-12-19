"use client"

import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield } from "lucide-react"

export default function TeamsPage() {
  const { teams, getPlayersByTeam } = useClub()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis Equipos</h1>
        <p className="text-muted-foreground">Todos los equipos de tu club</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const teamPlayers = getPlayersByTeam(team.id)
          return (
            <Card key={team.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Shield className="h-8 w-8 text-primary" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {teamPlayers.length}
                  </div>
                </div>
                <CardTitle className="text-card-foreground">{team.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{team.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jugadores:</span>
                    <span className="font-medium text-card-foreground">{teamPlayers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
