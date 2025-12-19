"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClub } from "@/contexts/club-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Trash2, Shield, Building2 } from "lucide-react"

export default function ClubsManagementPage() {
  const router = useRouter()
  const { currentUser, clubs, addClub, deleteClub, teams, addTeam, updateTeam, getTeamsByClub } = useClub()
  const [isClubDialogOpen, setIsClubDialogOpen] = useState(false)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [editingClub, setEditingClub] = useState<string | null>(null)
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)
  const [clubFormData, setClubFormData] = useState({
    name: "",
    coachId: "",
  })
  const [teamFormData, setTeamFormData] = useState({
    name: "",
    category: "",
    coachId: "",
  })

  // Redirigir si no es superadmin
  if (currentUser?.role !== "superadmin") {
    router.push("/dashboard")
    return null
  }

  const handleAddClub = () => {
    setEditingClub(null)
    setClubFormData({ name: "", coachId: "" })
    setIsClubDialogOpen(true)
  }

  const handleDeleteClub = (clubId: string) => {
    if (confirm("¿Estás seguro? Esto eliminará el club y todos sus equipos.")) {
      deleteClub(clubId)
    }
  }

  const handleSubmitClub = () => {
    if (!clubFormData.name || !clubFormData.coachId) {
      alert("Por favor completa todos los campos")
      return
    }

    addClub({
      id: `club${Date.now()}`,
      name: clubFormData.name,
      coachId: clubFormData.coachId,
    })

    setIsClubDialogOpen(false)
    setClubFormData({ name: "", coachId: "" })
  }

  const handleAddTeam = (clubId: string) => {
    setSelectedClubId(clubId)
    setTeamFormData({ name: "", category: "", coachId: "" })
    setIsTeamDialogOpen(true)
  }

  const handleSubmitTeam = () => {
    if (!teamFormData.name || !teamFormData.category || !selectedClubId) {
      alert("Por favor completa todos los campos")
      return
    }

    addTeam({
      id: `team${Date.now()}`,
      name: teamFormData.name,
      category: teamFormData.category,
      clubId: selectedClubId,
    })

    setIsTeamDialogOpen(false)
    setTeamFormData({ name: "", category: "", coachId: "" })
    setSelectedClubId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Clubes</h1>
          <p className="text-muted-foreground">Administra clubes, equipos y asigna entrenadores</p>
        </div>
        <Button onClick={handleAddClub} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Crear Club
        </Button>
      </div>

      {/* Lista de clubes */}
      <div className="space-y-6">
        {clubs.map((club) => {
          const clubTeams = getTeamsByClub(club.id)
          return (
            <Card key={club.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-card-foreground">{club.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        ID Entrenador Principal: {club.coachId}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddTeam(club.id)}
                      className="text-secondary hover:bg-secondary/10"
                      title="Añadir equipo"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClub(club.id)}
                      className="text-destructive hover:bg-destructive/10"
                      title="Eliminar club"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {clubTeams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay equipos en este club</p>
                    <Button
                      onClick={() => handleAddTeam(club.id)}
                      variant="outline"
                      className="mt-4 border-primary text-primary hover:bg-primary/10"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir primer equipo
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Equipo</TableHead>
                        <TableHead className="text-muted-foreground">Categoría</TableHead>
                        <TableHead className="text-muted-foreground">ID Entrenador Asignado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clubTeams.map((team) => (
                        <TableRow key={team.id} className="border-border">
                          <TableCell className="font-medium text-card-foreground">{team.name}</TableCell>
                          <TableCell className="text-card-foreground">{team.category}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            <span className="font-mono">N/A (Usar assignedTeamIds)</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog para crear club */}
      <Dialog open={isClubDialogOpen} onOpenChange={setIsClubDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Crear Nuevo Club</DialogTitle>
            <DialogDescription className="text-muted-foreground">Ingresa los datos del nuevo club</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clubName" className="text-card-foreground">
                Nombre del Club
              </Label>
              <Input
                id="clubName"
                value={clubFormData.name}
                onChange={(e) => setClubFormData({ ...clubFormData, name: e.target.value })}
                placeholder="Ej: Club Balonmano Barcelona"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="coachId" className="text-card-foreground">
                ID del Entrenador Principal
              </Label>
              <Input
                id="coachId"
                value={clubFormData.coachId}
                onChange={(e) => setClubFormData({ ...clubFormData, coachId: e.target.value })}
                placeholder="Ej: coach3"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsClubDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmitClub} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Crear Club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para añadir equipo */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Añadir Equipo al Club</DialogTitle>
            <DialogDescription className="text-muted-foreground">Completa los datos del equipo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName" className="text-card-foreground">
                Nombre del Equipo
              </Label>
              <Input
                id="teamName"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                placeholder="Ej: Senior B"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-card-foreground">
                Categoría
              </Label>
              <Input
                id="category"
                value={teamFormData.category}
                onChange={(e) => setTeamFormData({ ...teamFormData, category: e.target.value })}
                placeholder="Ej: Senior Femenino"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Nota:</strong> Para asignar este equipo a un entrenador, edita su{" "}
                <code className="text-secondary">assignedTeamIds</code> en el login.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTeamDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmitTeam} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Añadir Equipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info card */}
      <Card className="bg-card/50 border-border">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-card-foreground">Sistema de Asignación de Entrenadores</p>
              <p className="text-xs text-muted-foreground">
                Los entrenadores se asignan a equipos específicos mediante el campo <code>assignedTeamIds</code> en su
                perfil de usuario. Solo podrán editar los equipos incluidos en ese array. Para simular esto, usa los
                diferentes usuarios del login.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
