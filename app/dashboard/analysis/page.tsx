"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Activity, Users, Target, TrendingUp, ShieldAlert, Star, Save, Lock } from "lucide-react"

export default function AnalysisPage() {
  const { currentUser, getAccessibleTeams, getPlayersByTeam, getMatchesByTeam, canEditTeam } = useClub()
  const accessibleTeams = getAccessibleTeams()
  const [selectedTeam, setSelectedTeam] = useState(accessibleTeams[0]?.id || "")
  const [activeTab, setActiveTab] = useState("global")

  const teamMatches = getMatchesByTeam(selectedTeam)
  const teamPlayers = getPlayersByTeam(selectedTeam)
  const canEdit = canEditTeam(selectedTeam)

  const [preMatchNotes, setPreMatchNotes] = useState({
    rivalStrengths: "Contrataque rápido, pivote muy físico.",
    defensiveKeys: "6-0 cerrada, evitar lanzamientos de extremo izquierdo.",
    watchPlayers: "Dorsal 24 (Central), Dorsal 5 (Lateral Derecho).",
  })

  const [postMatchNotes, setPostMatchNotes] = useState({
    conclusions: "Buen repliegue defensivo. Debemos mejorar la efectividad en 7 metros.",
    rating: 8,
    privateNotes: "Vigilar fatiga de Pablo en la segunda parte.",
  })

  // Estadísticas globales (Mismo código anterior pero integrado en tabs)
  const totalGoals = teamMatches.reduce((sum, match) => sum + match.teamScore, 0)
  const totalMatches = teamMatches.length
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : "0"

  const playerGoalsMap: { [key: string]: number } = {}
  teamMatches.forEach((match) => {
    match.stats.forEach((stat) => {
      if (!playerGoalsMap[stat.playerName]) playerGoalsMap[stat.playerName] = 0
      playerGoalsMap[stat.playerName] += stat.goals
    })
  })

  const goalsChartData = Object.entries(playerGoalsMap).map(([name, goals]) => ({ name, goles: goals }))

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
          <h1 className="text-3xl font-bold text-foreground">Sala de Análisis</h1>
          <p className="text-muted-foreground">Planificación táctica y evaluación de rendimiento</p>
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

      <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="global">Análisis Global</TabsTrigger>
          <TabsTrigger value="pre-match">Pre-Partido</TabsTrigger>
          <TabsTrigger value="post-match">Post-Partido</TabsTrigger>
        </TabsList>

        {/* --- PESTAÑA 1: ANÁLISIS GLOBAL --- */}
        <TabsContent value="global" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Partidos</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{totalMatches}</div>
                <p className="text-xs text-muted-foreground">Temporada actual</p>
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

            {/* ... rest of global stats cards ... */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Efectividad</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{effectiveness}%</div>
                <p className="text-xs text-muted-foreground">Acierto en lanzamientos</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Jugadores</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{teamPlayers.length}</div>
                <p className="text-xs text-muted-foreground">Plantilla activa</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Producción Ofensiva</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={goalsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} />
                    <YAxis stroke="#888888" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px" }}
                    />
                    <Bar dataKey="goles" fill="#FF5722" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Distribución de Tiro</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={effectivenessData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {effectivenessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- PESTAÑA 2: PRE-PARTIDO --- */}
        <TabsContent value="pre-match" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    Planificación Táctica
                    {!canEdit && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Puntos Fuertes del Rival</Label>
                    <Textarea
                      value={preMatchNotes.rivalStrengths}
                      readOnly={!canEdit}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Claves Defensivas</Label>
                    <Textarea
                      value={preMatchNotes.defensiveKeys}
                      readOnly={!canEdit}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Jugadores a Vigilar</Label>
                    <Input
                      value={preMatchNotes.watchPlayers}
                      readOnly={!canEdit}
                      className="bg-background border-border"
                    />
                  </div>
                  {canEdit && (
                    <Button className="bg-primary text-primary-foreground w-full">
                      <Save className="mr-2 h-4 w-4" /> Guardar Planificación
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Comparativa de Equipos (Simulada)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead>Métrica</TableHead>
                        <TableHead className="text-center text-primary font-bold">Mi Equipo</TableHead>
                        <TableHead className="text-center text-secondary font-bold">Rival</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-border">
                        <TableCell>Goles/Partido</TableCell>
                        <TableCell className="text-center font-bold">{avgGoals}</TableCell>
                        <TableCell className="text-center font-bold">26.5</TableCell>
                      </TableRow>
                      <TableRow className="border-border">
                        <TableCell>% Eficiencia</TableCell>
                        <TableCell className="text-center font-bold">{effectiveness}%</TableCell>
                        <TableCell className="text-center font-bold">61.2%</TableCell>
                      </TableRow>
                      <TableRow className="border-border">
                        <TableCell>Pérdidas/Partido</TableCell>
                        <TableCell className="text-center font-bold">8.2</TableCell>
                        <TableCell className="text-center font-bold">11.5</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  Alerta Táctica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-bold text-primary mb-1">Cuidado con el Pivot</p>
                  <p className="text-xs text-muted-foreground">
                    El equipo rival suele jugar balones interiores cuando la defensa sale a presionar.
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <p className="text-sm font-bold text-secondary mb-1">Ritmo de Juego</p>
                  <p className="text-xs text-muted-foreground">
                    Prefieren ataques largos. Debemos intentar subir el ritmo y correr en primera oleada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- PESTAÑA 3: POST-PARTIDO --- */}
        <TabsContent value="post-match" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  Conclusiones Finales
                  {!canEdit && <Lock className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Resumen de Rendimiento</Label>
                  <Textarea
                    value={postMatchNotes.conclusions}
                    readOnly={!canEdit}
                    placeholder="Escribe las conclusiones del último encuentro..."
                    className="bg-background border-border min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground">Valoración del Entrenador</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          star <= postMatchNotes.rating ? "text-primary fill-primary" : "text-muted-foreground"
                        }`}
                        onClick={() => canEdit && setPostMatchNotes({ ...postMatchNotes, rating: star })}
                      />
                    ))}
                    <span className="ml-2 font-bold text-lg">{postMatchNotes.rating}/10</span>
                  </div>
                </div>

                {canEdit && (
                  <Button className="bg-primary text-primary-foreground w-full">
                    <Save className="mr-2 h-4 w-4" /> Guardar Evaluación
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Notas Privadas (Solo Entrenador)</CardTitle>
                <CardDescription className="text-muted-foreground text-xs uppercase font-bold tracking-wider">
                  Acceso Restringido - RBAC Coach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={postMatchNotes.privateNotes}
                  readOnly={!canEdit}
                  placeholder="Anotaciones confidenciales sobre jugadores o táctica..."
                  className="bg-background border-border min-h-[200px]"
                />
                <p className="mt-4 text-xs text-muted-foreground italic">
                  * Estas notas solo son visibles para el entrenador asignado y el superadministrador.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
