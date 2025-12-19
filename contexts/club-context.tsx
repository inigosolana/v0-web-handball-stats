"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type UserRole = "superadmin" | "coach" | "player"

export interface User {
  id: string
  name: string
  role: UserRole
  clubId?: string
  teamId?: string
  assignedTeamIds?: string[] // IDs de equipos que el entrenador puede editar
}

export interface Club {
  id: string
  name: string
  coachId: string
}

export interface Player {
  id: string
  name: string
  number: number
  position:
    | "Portero"
    | "Extremo Izquierdo"
    | "Extremo Derecho"
    | "Lateral Izquierdo"
    | "Lateral Derecho"
    | "Central"
    | "Pivote"
  teamId: string
  photo?: string
  height?: number // cm
  weight?: number // kg
}

export interface Team {
  id: string
  name: string
  category: string
  clubId: string
}

export interface MatchStats {
  playerId: string
  playerName: string
  goals: number
  misses: number
  turnovers: number
}

export interface Match {
  id: string
  date: Date
  teamId: string
  teamName: string
  rival: string
  teamScore: number
  rivalScore: number
  stats: MatchStats[]
}

interface ClubContextType {
  currentUser: User | null
  login: (user: User) => void
  logout: () => void

  clubs: Club[]
  addClub: (club: Club) => void
  deleteClub: (id: string) => void

  teams: Team[]
  addTeam: (team: Team) => void
  updateTeam: (id: string, team: Partial<Team>) => void
  getTeamsByClub: (clubId: string) => Team[]

  players: Player[]
  addPlayer: (player: Player) => void
  updatePlayer: (id: string, player: Partial<Player>) => void
  deletePlayer: (id: string) => void
  getPlayersByTeam: (teamId: string) => Player[]

  matches: Match[]
  addMatch: (match: Match) => void
  getMatchesByTeam: (teamId: string) => Match[]

  canEditTeam: (teamId: string) => boolean
  canDeleteFromTeam: (teamId: string) => boolean
  getAccessibleTeams: () => Team[]
  getPlayerStats: (playerId: string) => {
    totalGoals: number
    totalMisses: number
    totalTurnovers: number
    totalMatches: number
    accuracy: number
    avgGoalsPerMatch: number
  }
}

const ClubContext = createContext<ClubContextType | undefined>(undefined)

const initialClubs: Club[] = [
  { id: "club1", name: "Club Balonmano Madrid", coachId: "coach1" },
  { id: "club2", name: "Club Deportivo Valencia", coachId: "coach2" },
]

const initialTeams: Team[] = [
  { id: "1", name: "Senior A", category: "Senior Masculino", clubId: "club1" },
  { id: "2", name: "Juvenil B", category: "Juvenil Femenino", clubId: "club1" },
  { id: "3", name: "Cadete A", category: "Cadete Masculino", clubId: "club2" },
]

const initialPlayers: Player[] = [
  { id: "1", name: "Carlos Martínez", number: 1, position: "Portero", teamId: "1", height: 188, weight: 85 },
  { id: "2", name: "Pablo García", number: 10, position: "Central", teamId: "1", height: 192, weight: 95 },
  { id: "3", name: "David López", number: 7, position: "Extremo Derecho", teamId: "1", height: 182, weight: 78 },
  { id: "4", name: "Miguel Sánchez", number: 9, position: "Lateral Izquierdo", teamId: "1", height: 185, weight: 82 },
  { id: "5", name: "Javier Fernández", number: 14, position: "Pivote", teamId: "1", height: 190, weight: 90 },
  { id: "6", name: "Ana Rodríguez", number: 12, position: "Portero", teamId: "2", height: 175, weight: 65 },
  { id: "7", name: "Laura Martín", number: 8, position: "Central", teamId: "2", height: 178, weight: 70 },
  { id: "8", name: "Sara González", number: 11, position: "Extremo Izquierdo", teamId: "2", height: 172, weight: 63 },
]

const initialMatches: Match[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    teamId: "1",
    teamName: "Senior A",
    rival: "BM Ciudad Real",
    teamScore: 28,
    rivalScore: 24,
    stats: [
      { playerId: "2", playerName: "Pablo García", goals: 8, misses: 3, turnovers: 1 },
      { playerId: "3", playerName: "David López", goals: 6, misses: 2, turnovers: 0 },
      { playerId: "4", playerName: "Miguel Sánchez", goals: 7, misses: 4, turnovers: 2 },
      { playerId: "5", playerName: "Javier Fernández", goals: 7, misses: 1, turnovers: 1 },
    ],
  },
  {
    id: "2",
    date: new Date("2024-01-20"),
    teamId: "1",
    teamName: "Senior A",
    rival: "Atlético Madrid",
    teamScore: 26,
    rivalScore: 26,
    stats: [
      { playerId: "2", playerName: "Pablo García", goals: 9, misses: 4, turnovers: 0 },
      { playerId: "3", playerName: "David López", goals: 5, misses: 3, turnovers: 1 },
      { playerId: "4", playerName: "Miguel Sánchez", goals: 6, misses: 2, turnovers: 1 },
      { playerId: "5", playerName: "Javier Fernández", goals: 6, misses: 3, turnovers: 2 },
    ],
  },
]

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [clubs, setClubs] = useState<Club[]>(initialClubs)
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [matches, setMatches] = useState<Match[]>(initialMatches)

  const login = (user: User) => {
    setCurrentUser(user)
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const addClub = (club: Club) => {
    setClubs([...clubs, club])
  }

  const deleteClub = (id: string) => {
    setClubs(clubs.filter((c) => c.id !== id))
  }

  const addTeam = (team: Team) => {
    setTeams([...teams, team])
  }

  const updateTeam = (id: string, updatedTeam: Partial<Team>) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, ...updatedTeam } : t)))
  }

  const getTeamsByClub = (clubId: string) => {
    return teams.filter((t) => t.clubId === clubId)
  }

  const addPlayer = (player: Player) => {
    setPlayers([...players, player])
  }

  const updatePlayer = (id: string, updatedPlayer: Partial<Player>) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, ...updatedPlayer } : p)))
  }

  const deletePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id))
  }

  const addMatch = (match: Match) => {
    setMatches([...matches, match])
  }

  const getPlayersByTeam = (teamId: string) => {
    return players.filter((p) => p.teamId === teamId)
  }

  const getMatchesByTeam = (teamId: string) => {
    return matches.filter((m) => m.teamId === teamId)
  }

  const canEditTeam = (teamId: string) => {
    if (!currentUser) return false

    if (currentUser.role === "superadmin") return true

    if (currentUser.role === "coach") {
      // El entrenador solo puede editar sus equipos asignados
      return currentUser.assignedTeamIds?.includes(teamId) || false
    }

    return false
  }

  const canDeleteFromTeam = (teamId: string) => {
    if (!currentUser) return false

    if (currentUser.role === "superadmin") return true

    if (currentUser.role === "coach") {
      return currentUser.assignedTeamIds?.includes(teamId) || false
    }

    return false
  }

  const getAccessibleTeams = () => {
    if (!currentUser) return []

    if (currentUser.role === "superadmin") {
      return teams
    }

    if (currentUser.role === "coach" && currentUser.clubId) {
      return teams.filter((t) => t.clubId === currentUser.clubId)
    }

    if (currentUser.role === "player" && currentUser.teamId) {
      return teams.filter((t) => t.id === currentUser.teamId)
    }

    return []
  }

  const getPlayerStats = (playerId: string) => {
    const playerMatches = matches.flatMap((match) => match.stats.filter((stat) => stat.playerId === playerId))

    const totalGoals = playerMatches.reduce((sum, stat) => sum + stat.goals, 0)
    const totalMisses = playerMatches.reduce((sum, stat) => sum + stat.misses, 0)
    const totalTurnovers = playerMatches.reduce((sum, stat) => sum + stat.turnovers, 0)
    const totalShots = totalGoals + totalMisses
    const totalMatches = playerMatches.length

    return {
      totalGoals,
      totalMisses,
      totalTurnovers,
      totalMatches,
      accuracy: totalShots > 0 ? (totalGoals / totalShots) * 100 : 0,
      avgGoalsPerMatch: totalMatches > 0 ? totalGoals / totalMatches : 0,
    }
  }

  return (
    <ClubContext.Provider
      value={{
        currentUser,
        login,
        logout,
        clubs,
        addClub,
        deleteClub,
        teams,
        addTeam,
        updateTeam,
        getTeamsByClub,
        players,
        addPlayer,
        updatePlayer,
        deletePlayer,
        addMatch,
        getPlayersByTeam,
        getMatchesByTeam,
        canEditTeam,
        canDeleteFromTeam,
        getAccessibleTeams,
        getPlayerStats,
      }}
    >
      {children}
    </ClubContext.Provider>
  )
}

export function useClub() {
  const context = useContext(ClubContext)
  if (context === undefined) {
    throw new Error("useClub must be used within a ClubProvider")
  }
  return context
}
