"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useClub } from "@/contexts/club-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Activity,
  Users,
  Target,
  TrendingUp,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  UserCircle,
  Lock,
} from "lucide-react"

const positions = [
  "Portero",
  "Extremo Izquierdo",
  "Extremo Derecho",
  "Lateral Izquierdo",
  "Lateral Derecho",
  "Central",
  "Pivote",
]

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const teamId = resolvedParams.id
  const router = useRouter()
  const {
    currentUser,
    teams,
    getPlayersByTeam,
    getMatchesByTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
    canEditTeam,
    canDeleteFromTeam,
    getPlayerStats,
    getAccessibleTeams,
  } = useClub()

  const [selectedTeamId, setSelectedTeamId] = useState(teamId)
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    position: "",
    height: "",
    weight: "",
  })

  const accessibleTeams = getAccessibleTeams()
  const currentTeam = teams.find((t) => t.id === selectedTeamId)
  const teamPlayers = getPlayersByTeam(selectedTeamId)
  const teamMatches = getMatchesByTeam(selectedTeamId)
  const canEdit = canEditTeam(selectedTeamId)
  const canDelete = canDeleteFromTeam(selectedTeamId)

  // Estadísticas del equipo
  const totalGoals = teamMatches.reduce((sum, match) => sum + match.teamScore, 0)
  const totalMatches = teamMatches.length
  const wins = teamMatches.filter((m) => m.teamScore > m.rivalScore).length
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : "0"

  // Datos para gráfica de goles por jugador
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

  // Datos para gráfica de efectividad
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

  const handleTeamChange = (newTeamId: string) => {
    setSelectedTeamId(newTeamId)
    router.push(`/dashboard/team/${newTeamId}`)
  }

  const handleAddPlayer = () => {
    setEditingPlayer(null)
    setFormData({ name: "", number: "", position: "", height: "", weight: "" })
    setIsPlayerDialogOpen(true)
  }

  const handleEditPlayer = (playerId: string) => {
    const player = teamPlayers.find((p) => p.id === playerId)
    if (player) {
      setEditingPlayer(playerId)
      setFormData({
        name: player.name,
        number: player.number.toString(),
        position: player.position,
        height: player.height?.toString() || "",
        weight: player.weight?.toString() || "",
      })
      setIsPlayerDialogOpen(true)
    }
  }

  const handleDeletePlayer = (playerId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      deletePlayer(playerId)
    }
  }

  const handleSubmitPlayer = () => {
    if (!formData.name || !formData.number || !formData.position) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    if (editingPlayer) {
      updatePlayer(editingPlayer, {
        name: formData.name,
        number: Number.parseInt(formData.number),
        position: formData.position as any,
        height: formData.height ? Number.parseInt(formData.height) : undefined,
        weight: formData.weight ? Number.parseInt(formData.weight) : undefined,
      })
    } else {
      addPlayer({
        id: Date.now().toString(),
        name: formData.name,
        number: Number.parseInt(formData.number),
        position: formData.position as any,
        teamId: selectedTeamId,
        height: formData.height ? Number.parseInt(formData.height) : undefined,
        weight: formData.weight ? Number.parseInt(formData.weight) : undefined,
      })
    }

    setIsPlayerDialogOpen(false)
    setFormData({ name: "", number: "", position: "", height: "", weight: "" })
  }

  const handleViewProfile = (playerId: string) => {
    setSelectedPlayerId(playerId)
    setIsProfileModalOpen(true)
  }

  const selectedPlayer = selectedPlayerId ? teamPlayers.find((p) => p.id === selectedPlayerId) : null
  const playerStats = selectedPlayerId ? getPlayerStats(selectedPlayerId) : null

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard")} className="w-fit text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Mis Equipos
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentTeam?.name}</h1>
            <p className="text-muted-foreground">{currentTeam?.category}</p>
            {!canEdit && currentUser?.role === "coach" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Lock className="h-3 w-3" />
                Modo observador - Sin permisos de edición
              </span>
            )}
          </div>
          <Select value={selectedTeamId} onValueChange={handleTeamChange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-border">
              <SelectValue placeholder="Cambiar equipo" />
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
      </div>

      {/* Pestañas: Análisis y Plantilla */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="analysis">Análisis Global</TabsTrigger>
          <TabsTrigger value="roster">Plantilla</TabsTrigger>
        </TabsList>

        {/* Pestaña A: Análisis Global */}
        <TabsContent value="analysis" className="space-y-6">
          {/* Tarjetas de estadísticas */}
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

          {/* Gráficas */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Goles por Jugador</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Total de goles en todos los partidos
                </CardDescription>
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
        </TabsContent>

        {/* Pestaña B: Plantilla */}
        <TabsContent value="roster" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">{teamPlayers.length} jugadores registrados</p>
            {canEdit && (
              <Button onClick={handleAddPlayer} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Jugador
              </Button>
            )}
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              {teamPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay jugadores registrados en este equipo</p>
                  {canEdit && (
                    <Button
                      onClick={handleAddPlayer}
                      variant="outline"
                      className="mt-4 border-primary text-primary hover:bg-primary/10 bg-transparent"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir primer jugador
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Dorsal</TableHead>
                      <TableHead className="text-muted-foreground">Nombre</TableHead>
                      <TableHead className="text-muted-foreground">Posición</TableHead>
                      <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamPlayers.map((player) => (
                      <TableRow key={player.id} className="border-border">
                        <TableCell className="font-bold text-primary">{player.number}</TableCell>
                        <TableCell className="text-card-foreground">{player.name}</TableCell>
                        <TableCell className="text-card-foreground">{player.position}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewProfile(player.id)}
                              className="text-secondary hover:bg-secondary/10"
                              title="Ver perfil"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPlayer(player.id)}
                                className="text-secondary hover:bg-secondary/10"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePlayer(player.id)}
                                className="text-destructive hover:bg-destructive/10"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para añadir/editar jugador */}
      <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {editingPlayer ? "Editar Jugador" : "Añadir Jugador"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Completa la información del jugador</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-card-foreground">
                Nombre Completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Pablo García"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number" className="text-card-foreground">
                  Dorsal *
                </Label>
                <Input
                  id="number"
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ej: 10"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="position" className="text-card-foreground">
                  Posición *
                </Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height" className="text-card-foreground">
                  Altura (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Ej: 185"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-card-foreground">
                  Peso (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Ej: 82"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPlayerDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmitPlayer} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editingPlayer ? "Guardar Cambios" : "Añadir Jugador"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Perfil del Jugador */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground text-2xl">Perfil del Jugador</DialogTitle>
          </DialogHeader>
          {selectedPlayer && playerStats && (
            <div className="space-y-6">
              {/* Datos personales */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold text-card-foreground">{selectedPlayer.name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-primary font-bold text-lg">#{selectedPlayer.number}</span>
                    <span className="text-muted-foreground">{selectedPlayer.position}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {selectedPlayer.height && (
                      <div>
                        <p className="text-xs text-muted-foreground">Altura</p>
                        <p className="text-lg font-semibold text-card-foreground">{selectedPlayer.height} cm</p>
                      </div>
                    )}
                    {selectedPlayer.weight && (
                      <div>
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="text-lg font-semibold text-card-foreground">{selectedPlayer.weight} kg</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estadísticas acumuladas */}
              <div>
                <h4 className="text-lg font-semibold text-card-foreground mb-4">Estadísticas de la Temporada</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Partidos Jugados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-card-foreground">{playerStats.totalMatches}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Goles Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">{playerStats.totalGoals}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">% Acierto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-secondary">{playerStats.accuracy.toFixed(1)}%</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Goles/Partido</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-card-foreground">
                        {playerStats.avgGoalsPerMatch.toFixed(1)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Fallos Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-card-foreground">{playerStats.totalMisses}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Pérdidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-card-foreground">{playerStats.totalTurnovers}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {canEdit && (
                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      setIsProfileModalOpen(false)
                      handleEditPlayer(selectedPlayer.id)
                    }}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar Jugador
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
