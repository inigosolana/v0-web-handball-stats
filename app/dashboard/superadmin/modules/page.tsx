"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Zap, Lock, Unlock } from "lucide-react"

export default function SuperadminModulesPage() {
    const { teams } = useClub()
    // Mock state for premium features enabled per team/club
    // In real app, this comes from 'club_features' table
    const [premiumStatus, setPremiumStatus] = useState<Record<string, boolean>>({
        '1': true, // Senior A has premium
        '2': false // Juvenil B does not
    })

    const togglePremium = (teamId: string) => {
        setPremiumStatus(prev => ({
            ...prev,
            [teamId]: !prev[teamId]
        }))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Módulos (Superadmin)</h1>
                <p className="text-muted-foreground">Activa funcionalidades premium para los clubes</p>
            </div>

            <div className="grid gap-6">
                {teams.map(team => (
                    <Card key={team.id} className="bg-card border-border flex flex-row items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${premiumStatus[team.id] ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle>{team.name}</CardTitle>
                                <CardDescription>{team.category}</CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right mr-4">
                                <p className="text-sm font-medium mb-1">Módulo AI Video</p>
                                {premiumStatus[team.id] ? (
                                    <Badge variant="default" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">ACTIVO</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground">INACTIVO</Badge>
                                )}
                            </div>
                            <Switch
                                checked={premiumStatus[team.id] || false}
                                onCheckedChange={() => togglePremium(team.id)}
                            />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
