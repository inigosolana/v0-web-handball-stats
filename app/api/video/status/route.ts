import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const filename = searchParams.get('filename')

    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const progressFile = path.join(uploadDir, `${filename}.progress.json`)

    if (!fs.existsSync(progressFile)) {
        // If progress file doesn't exist, maybe it hasn't started or finished and cleaned up?
        // Or maybe it never existed.
        return NextResponse.json({ progress: 0, status: 'unknown' })
    }

    try {
        const content = fs.readFileSync(progressFile, 'utf-8')
        const data = JSON.parse(content)
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ progress: 0, status: 'error_reading_progress' })
    }
}
