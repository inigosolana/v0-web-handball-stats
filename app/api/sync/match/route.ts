import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. Authenticate
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            external_id,
            date,
            local_team_id,
            visitor_team_name,
            visitor_team_id,
            local_score,
            visitor_score,
            events
        } = body;

        // 2. Validate required fields
        if (!local_team_id || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Insert Match
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .insert({
                external_id,
                date,
                local_team_id,
                visitor_team_name,
                visitor_team_id,
                local_score,
                visitor_score,
                status: 'synced'
            })
            .select()
            .single();

        if (matchError) {
            console.error('Error creating match:', matchError);
            return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
        }

        // 4. Insert Events (if any)
        if (events && events.length > 0) {
            const formattedEvents = events.map((e: any) => ({
                match_id: match.id,
                player_id: e.player_id,
                event_type: e.type, // goal, save, etc.
                time_seconds: e.time,
                coord_x: e.x,
                coord_y: e.y
            }));

            const { error: eventsError } = await supabase
                .from('match_events')
                .insert(formattedEvents);

            if (eventsError) {
                console.error('Error inserting events:', eventsError);
                // We verified the match was created, so we might want to return partial success or rollback
                return NextResponse.json({ error: 'Match created but events failed' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, match_id: match.id });

    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
