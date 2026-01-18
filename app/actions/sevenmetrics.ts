"use server"

export type TeamSide = "A" | "B"
export type DefenseType = "6:0" | "5:1" | "3:2:1" | "4:2" | "Mixta" | "Presión" | "Otro"
export type MatchStatus = "SETUP" | "IN_PROGRESS" | "PAUSED" | "FINISHED"
export type Position = "Portero" | "Extremo Izq" | "Extremo Der" | "Lateral Izq" | "Lateral Der" | "Central" | "Pivote"
export type Hand = "Diestro" | "Zurdo"
export type ActionType =
    | "GOL"
    | "GOL 7M"
    | "GOL CAMPO A CAMPO"
    | "FALLO 7M"
    | "PARADA"
    | "FUERA"
    | "POSTE"
    | "BLOCADO"
    | "PÉRDIDA"
    | "RECUPERACIÓN"
    | "ASISTENCIA"
export type CourtZone = "Extremo Izq" | "Lateral Izq" | "Central" | "Lateral Der" | "Extremo Der" | "Pivote" | "9m"

export interface Match {
    id: string
    team_a_name: string
    team_b_name: string
    defense_a: DefenseType
    defense_b: DefenseType
    initial_possession?: TeamSide | null
    local_score: number
    visitor_score: number
    total_time_seconds: number
    status: MatchStatus
    created_at: string
    updated_at?: string
}

export interface Player {
    id: string
    match_id: string
    team: TeamSide
    number: number
    name: string
    is_goalkeeper: boolean
    position?: Position | null
    hand?: Hand | null
    created_at?: string
}

export interface Event {
    id: string
    match_id: string
    timestamp: number
    time_formatted: string
    player: number
    team: TeamSide
    action: ActionType
    court_zone?: CourtZone | null
    goal_zone?: number | null
    defense_at_moment?: DefenseType | null
    context?: string[] | null
    rival_goalkeeper?: number | null
    created_at?: string
}

const API_BASE_URL = "https://sevenmetrics-api.onrender.com"

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Add no-store to avoid stale data, or revalidate path
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        cache: 'no-store'
    })

    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`)
    }

    return res.json()
}

// Server Actions
export async function getMatches(skip = 0, limit = 50) {
    return fetchAPI<Match[]>(`/matches/?skip=${skip}&limit=${limit}`)
}

export async function getMatch(matchId: string) {
    return fetchAPI<Match>(`/matches/${matchId}`)
}

export async function getMatchPlayers(matchId: string, team?: TeamSide) {
    const query = team ? `?team=${team}` : ""
    return fetchAPI<Player[]>(`/matches/${matchId}/players/${query}`)
}

export async function getMatchEvents(matchId: string) {
    return fetchAPI<Event[]>(`/events/${matchId}`)
}

export async function getFullStats(matchId: string) {
    return fetchAPI<Record<string, any>>(`/matches/${matchId}/statistics/`)
}
