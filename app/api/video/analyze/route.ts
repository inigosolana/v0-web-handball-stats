import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { filename } = body

        if (!filename) {
            return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 })
        }

        // Paths
        // We assume the file is in public/uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        const videoPath = path.join(uploadDir, filename)
        const progressFile = path.join(uploadDir, `${filename}.progress.json`)

        if (!fs.existsSync(videoPath)) {
            return NextResponse.json({ success: false, error: 'Video file not found' }, { status: 404 })
        }

        // Initialize progress file
        fs.writeFileSync(progressFile, JSON.stringify({ progress: 0, status: 'starting' }))

        // Spawn Python process
        // Note: Using the venv python executable
        const pythonScript = path.join(process.cwd(), 'python', 'handball_pipeline.py')
        const venvPython = path.join(process.cwd(), 'venv', 'Scripts', 'python.exe')

        // Check if venv python exists, fallback to system python/py if not (though we set it up)
        const pythonExe = fs.existsSync(venvPython) ? venvPython : 'python'

        console.log(`Spawning: ${pythonExe} ${pythonScript} --video ${videoPath} --progress-file ${progressFile}`)

        const child = spawn(pythonExe, [
            pythonScript,
            '--video', videoPath,
            '--progress-file', progressFile,
            '--export-clips'
        ], {
            detached: true,
            stdio: 'ignore' // or 'inherit' for debugging, but 'ignore' for detached
        })

        child.unref()

        return NextResponse.json({
            success: true,
            message: 'Analysis started',
            progressFile: `/uploads/${filename}.progress.json`
        })

    } catch (e: any) {
        console.error('Analysis Start Error:', e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
