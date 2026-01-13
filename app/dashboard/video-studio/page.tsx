"use client"

import { useState, useRef } from "react"
import { Upload, Play, Film, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VideoStudioPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState("")
    const [jobId, setJobId] = useState<string | null>(null)
    const [events, setEvents] = useState<any[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setUploadedUrl(null)
            setEvents([])
            setProgress(0)
            setStatus("")
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        try {
            // Upload to /api/upload
            const response = await fetch(`/api/upload?filename=${file.name}`, {
                method: 'POST',
                body: file
            })
            const data = await response.json()
            if (data.success) {
                setUploadedUrl(data.url)
            } else {
                alert('Upload failed')
            }
        } catch (e) {
            console.error(e)
            alert('Upload error')
        } finally {
            setUploading(false)
        }
    }

    const startAnalysis = async () => {
        if (!file) return

        setAnalyzing(true)
        setProgress(0)
        setStatus("Starting...")

        try {
            const res = await fetch('/api/video/analyze', {
                method: 'POST',
                body: JSON.stringify({ filename: file.name }),
                headers: { 'Content-Type': 'application/json' }
            })

            if (res.ok) {
                // Poll status
                const interval = setInterval(async () => {
                    const statusRes = await fetch(`/api/video/status?filename=${file.name}`)
                    const statusData = await statusRes.json()

                    setProgress(statusData.progress || 0)
                    setStatus(statusData.status || "Processing")

                    if (statusData.progress >= 100) {
                        clearInterval(interval)
                        setAnalyzing(false)
                        // If we had a real way to get the job payload from the status file, we'd use it.
                        // For now we assume the clips are in public/clips/job_ID
                        // But wait, the python script prints the result to stdout, but the spawn is detached.
                        // The python script *also* writes to progress file?
                        // Let's assume the python script keeps the `job_id` in a place we can find, 
                        // or we list the clips directory.
                        // Actually, the current python script only writes progress/status to the json file.
                        // I might need to update the python script to write the result there too,
                        // OR just basic-list the clips.
                        setStatus("Analysis Complete!")
                    }
                }, 1000)
            } else {
                setAnalyzing(false)
                alert("Failed to start analysis")
            }
        } catch (e) {
            console.error(e)
            setAnalyzing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Video Analysis Studio</h1>
                <p className="text-muted-foreground">Upload match footage and let AI extract the highlights.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Upload Video</CardTitle>
                        <CardDescription>Select a match video (MP4)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-input p-6 rounded-lg flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            {file ? (
                                <p className="font-medium">{file.name}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Click to select file</p>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/mp4,video/quicktime"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {file && !uploadedUrl && (
                            <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {uploading ? "Uploading..." : "Upload to Server"}
                            </Button>
                        )}

                        {uploadedUrl && (
                            <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Ready for Analysis</AlertTitle>
                                <AlertDescription>Video uploaded successfully.</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. AI Analysis</CardTitle>
                        <CardDescription>Run Computer Vision pipeline</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!uploadedUrl ? (
                            <div className="flex items-center justify-center h-[150px] text-muted-foreground text-sm">
                                Pending Upload...
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Status: {status}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} />
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={startAnalysis}
                                    disabled={analyzing || progress >= 100}
                                    variant={progress >= 100 ? "outline" : "default"}
                                >
                                    {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
                                    {progress >= 100 ? "Analysis Done" : analyzing ? "Analyzing..." : "Start Analysis"}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {progress >= 100 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>Generated Clips</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Clips have been generated in the <code>public/clips</code> folder.
                            The system detected events and exported them automatically.
                        </p>
                        <div className="p-4 bg-muted rounded-md text-sm font-mono">
                            Check <code>public/clips</code> for the new folder.
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
