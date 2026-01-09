import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    // Determine confidence/delay based on parameters (if we wanted to be fancy)
    // For now, just return a mock delay and some data.

    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing

    const mockEvents = [
        {
            time_seconds: 15.5,
            end_time: 22.0,
            event_type: 'goal',
            team_id: 'home',
            confidence_score: 0.85,
            phase: 'fastbreak',
            state: '6v6',
            tags: ['fast_break', 'wing_shot']
        },
        {
            time_seconds: 45.2,
            end_time: 52.0,
            event_type: 'turnover',
            team_id: 'away',
            confidence_score: 0.72,
            phase: 'positional',
            state: '6v6',
            tags: ['bad_pass']
        },
        {
            time_seconds: 88.0,
            end_time: 95.0,
            event_type: 'save',
            team_id: 'home',
            confidence_score: 0.92,
            phase: 'positional',
            state: '6v5',
            tags: ['jump_shot']
        }
    ]

    return NextResponse.json({
        success: true,
        events: mockEvents,
        model_version: "yolo-v8-handball-beta-1"
    })
}
