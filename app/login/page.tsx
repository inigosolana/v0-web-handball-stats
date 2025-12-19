"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClub, type UserRole } from "@/contexts/club-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Shield, User, Users } from "lucide-react"

const mockUsers = [
  {
    id: "superadmin1",
    name: "Admin Principal",
    role: "superadmin" as UserRole,
    description: "Acceso total a todos los clubes y equipos",
    icon: Shield,
  },
  {
    id: "coach1",
    name: "Entrenador Madrid",
    role: "coach" as UserRole,
    clubId: "club1",
    description: "Gestión del Club Balonmano Madrid",
    icon: Users,
  },
  {
    id: "player1",
    name: "Pablo García",
    role: "player" as UserRole,
    clubId: "club1",
    teamId: "1",
    description: "Jugador del equipo Senior A",
    icon: User,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useClub()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const handleLogin = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user.id)
    setTimeout(() => {
      login({
        id: user.id,
        name: user.name,
        role: user.role,
        clubId: user.clubId,
        teamId: user.teamId,
      })
      router.push("/dashboard")
    }, 300)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">
              Handball<span className="text-primary">.AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Login Simulado</h1>
          <p className="text-muted-foreground">Selecciona con qué rol quieres acceder al sistema</p>
        </div>

        {/* Cards de roles */}
        <div className="grid gap-4 md:grid-cols-3">
          {mockUsers.map((user) => (
            <Card
              key={user.id}
              className={`bg-card border-border cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg ${
                selectedUser === user.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => handleLogin(user)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <user.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-card-foreground text-xl">{user.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                    {user.role === "superadmin" ? "Superadmin" : user.role === "coach" ? "Entrenador" : "Jugador"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">{user.description}</p>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={selectedUser === user.id}
                >
                  {selectedUser === user.id ? "Accediendo..." : "Acceder"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info adicional */}
        <Card className="mt-8 bg-card/50 border-border">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-card-foreground mb-2">Permisos por Rol:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-primary">Superadmin:</strong> Ve todos los clubes, puede crear/borrar clubes y
                  asignar entrenadores
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-secondary">Entrenador:</strong> Ve solo su club y equipos, gestiona plantilla
                  (CRUD completo)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Jugador:</strong> Vista de solo lectura, puede ver estadísticas pero no editar
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
