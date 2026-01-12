import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pump = promisify(pipeline)

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = path.join(uploadDir, safeName)

        // Convert web stream to node stream and save
        // @ts-ignore
        await pump(file.stream(), fs.createWriteStream(filePath))

        const publicPath = `/uploads/${safeName}`
        return NextResponse.json({ success: true, url: publicPath })

    } catch (e) {
        console.error("Upload Error:", e)
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
    }
}
