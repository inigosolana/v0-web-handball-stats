"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Activity, Users, Target, TrendingUp } from "lucide-react"

export default function AnalysisPage() {
  const { getAccessibleTeams, matches, getPlayersByTeam, getMatchesByTeam } = useClub()
  const accessibleTeams = getAccessibleTeams()
  const [selectedTeam, setSelectedTeam] = useState(accessibleTeams[0]?.id || "")

  const teamMatches = getMatchesByTeam(selectedTeam)
  const teamPlayers = getPlayersByTeam(selectedTeam)

  const totalGoals = teamMatches.reduce((sum, match) => sum + match.teamScore, 0)
  const totalMatches = teamMatches.length
  const wins = teamMatches.filter((m) => m.teamScore > m.rivalScore).length
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : "0"

  const playerGoalsMap: { [key: string]: number } = {}
  teamMatches.forEach((match) => {
    match.stats.forEach((stat) => {
      if (!playerGoalsMap[stat.playerName]) {
        playerGoalsMap[stat.playerName] = 0
      }
      playerGoalsMap[stat.playerName] += stat.goals
    })
  })

  const goalsChartData = Object.entries(playerGoalsMap).map(([name, goals]) => ({
    name,
    goles: goals,
  }))

  let totalAttempts = 0
  let totalSuccessful = 0
  teamMatches.forEach((match) => {
    match.stats.forEach((stat) => {
      totalSuccessful += stat.goals
      totalAttempts += stat.goals + stat.misses
    })
  })

  const effectiveness = totalAttempts > 0 ? ((totalSuccessful / totalAttempts) * 100).toFixed(1) : 0
  const effectivenessData = [
    { name: "Aciertos", value: totalSuccessful, color: "#FF5722" },
    { name: "Fallos", value: totalAttempts - totalSuccessful, color: "#424242" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Análisis</h1>
          <p className="text-muted-foreground">Estadísticas y gráficas de rendimiento del equipo</p>
        </div>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-full sm:w-[200px] bg-card border-border">
            <SelectValue placeholder="Seleccionar equipo" />
          </SelectTrigger>
          <SelectContent>
            {accessibleTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Partidos</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalMatches}</div>
            <p className="text-xs text-muted-foreground">Jugados esta temporada</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Victorias</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{wins}</div>
            <p className="text-xs text-muted-foreground">
              {totalMatches > 0 ? `${((wins / totalMatches) * 100).toFixed(0)}% de partidos` : "Sin datos"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Goles Totales</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">{avgGoals} goles por partido</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Jugadores</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{teamPlayers.length}</div>
            <p className="text-xs text-muted-foreground">En la plantilla</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Goles por Jugador</CardTitle>
            <CardDescription className="text-muted-foreground">Total de goles en todos los partidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="goles" fill="#FF5722" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Efectividad de Tiro</CardTitle>
            <CardDescription className="text-muted-foreground">
              {effectiveness}% de efectividad del equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={effectivenessData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {effectivenessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
