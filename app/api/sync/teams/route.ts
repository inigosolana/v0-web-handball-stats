import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Mock data until DB is fully connected
// In a real scenario, this would query your Supabase 'teams' and 'players' tables
const getMockTeams = (userId: string) => [
    {
        id: "1",
        name: "Senior A Masculino",
        category: "Senior",
        players: [
            { id: "1", name: "Carlos Martínez", number: 1, position: "Portero" },
            { id: "2", name: "Pablo García", number: 10, position: "Central" },
            // ... more players
        ]
    },
    {
        id: "2",
        name: "Juvenil B Femenino",
        category: "Juvenil",
        players: [
            { id: "6", name: "Ana Rodríguez", number: 12, position: "Portero" },
            { id: "7", name: "Laura Martín", number: 8, position: "Central" },
        ]
    }
];

export async function GET(request: Request) {
    const supabase = await createClient();

    // 1. Authenticate the External App User
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Fetch Teams assigned to this Coach
        // For now, we return mock data, but this should query:
        // select * from teams where coach_id = user.id (or via team_coaches table)

        // const { data: teams, error } = await supabase
        //   .from('teams')
        //   .select('*, players(*)')
        //   .eq('coach_id', user.id);

        // Using mock data for demonstration as per current file structure
        const teams = getMockTeams(user.id);

        return NextResponse.json({
            data: {
                matches_synced: 0, // Metadata example
                teams: teams
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
