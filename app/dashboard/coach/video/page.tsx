"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Film, Wand2, ArrowLeft } from "lucide-react"
import { VideoStudioLayout } from "@/components/match/video-studio-layout"

export default function VideoAnalysisPage() {
    const { matches } = useClub()
    const [selectedMatchId, setSelectedMatchId] = useState<string>("")
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [viewMode, setViewMode] = useState<"upload" | "studio">("upload")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadedFile(file)
            setVideoUrl(URL.createObjectURL(file))
        }
    }

    const handleEnterStudio = () => {
        if (videoUrl) {
            setViewMode("studio")
        }
    }

    if (viewMode === "studio") {
        return (
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-4 border-b pb-4">
                    <Button variant="ghost" size="sm" onClick={() => setViewMode("upload")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Upload
                    </Button>
                    <h2 className="font-bold text-lg">Video Analysis Studio</h2>
                    <span className="text-muted-foreground text-sm">
                        {uploadedFile?.name}
                    </span>
                </div>
                <VideoStudioLayout videoUrl={videoUrl} />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pt-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Video Analysis Center</h1>
                <p className="text-muted-foreground">Upload match footage to start cutting clips and analyzing performance.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Session Setup</CardTitle>
                    <CardDescription>Select a match and upload video file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Match Context</Label>
                            <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select match..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {matches.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.teamName} vs {m.rival}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="training">Training Session</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Video Source</Label>
                            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Film className="w-8 h-8 text-muted-foreground" />
                                    <span className="font-medium text-sm">
                                        {uploadedFile ? uploadedFile.name : "Click to select video"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            size="lg"
                            disabled={!videoUrl}
                            onClick={handleEnterStudio}
                            className="w-full md:w-auto gap-2"
                        >
                            <Wand2 className="w-4 h-4" />
                            Enter Studio
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
