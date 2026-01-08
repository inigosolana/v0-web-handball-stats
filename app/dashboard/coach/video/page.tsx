"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { VideoSmartPlayer } from "@/components/match/video-smart-player"
import { Upload, Film, Link as LinkIcon, AlertCircle, Cpu, Loader2, Lock, Wand2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function VideoAnalysisPage() {
    const { matches } = useClub()
    const [selectedMatchId, setSelectedMatchId] = useState<string>("")
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [isUrlMode, setIsUrlMode] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)

    // AI Processing State
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingStep, setProcessingStep] = useState("")
    const [aiEvents, setAiEvents] = useState<any[]>([])

    // Mock Premium Check (should come from context/DB)
    const hasPremium = true

    const selectedMatch = matches.find(m => m.id === selectedMatchId)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadedFile(file)
            setVideoUrl(URL.createObjectURL(file))
            setAiEvents([]) // Reset events on new file
        }
    }

    const startAIAnalysis = async () => {
        if (!videoUrl) return;

        setIsProcessing(true)
        setProcessingStep("Inicializando YOLO v11...")

        // Simulate steps
        setTimeout(() => setProcessingStep("Analizando frames (GPU)..."), 1000)
        setTimeout(() => setProcessingStep("Detectando eventos clave..."), 2000)

        try {
            const response = await fetch('/api/ai/process', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                setAiEvents(data.events.map((e: any, i: number) => ({
                    id: `ai-${i}`,
                    time: e.time_start,
                    label: `${e.label} (${(e.confidence * 100).toFixed(0)}%)`
                })))
            }
        } catch (error) {
            console.error("AI Error", error)
        } finally {
            setIsProcessing(false)
            setProcessingStep("")
        }
    }

    if (!hasPremium) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-8">
                <div className="bg-primary/10 p-6 rounded-full">
                    <Lock className="w-16 h-16 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Función Premium: AI Video Analysis</h1>
                <p className="text-muted-foreground max-w-lg">
                    El sistema de recorte automático con Inteligencia Artificial (YOLO v11) está reservado para clubes Pro.
                    Contacta con el administrador para activar este módulo.
                </p>
                <Button size="lg" className="gap-2">
                    <Wand2 className="w-4 h-4" />
                    Solicitar Acceso
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        Video Análisis AI
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                            YOLO v11 POWERED
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground">Sube el video y deja que la IA detecte los mejores momentos</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sidebar: Configuration */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Entrada de Video</CardTitle>
                            <CardDescription>Formatos soportados: MP4, MOV</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Partido Asociado</Label>
                                <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar partido..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {matches.map(m => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.teamName} vs {m.rival}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                                    <Film className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">
                                        {uploadedFile ? uploadedFile.name : "Subir archivo de video"}
                                    </span>
                                </label>
                            </div>

                            {/* Action Button */}
                            <div className="pt-2">
                                {isProcessing ? (
                                    <Button disabled className="w-full">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {processingStep}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={startAIAnalysis}
                                        disabled={!videoUrl}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    >
                                        <Cpu className="w-4 h-4 mr-2" />
                                        ANALIZAR CON IA
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Summary */}
                    {aiEvents.length > 0 && (
                        <Card className="bg-card border-border border-l-4 border-l-green-500">
                            <CardHeader className="py-4">
                                <CardTitle className="text-md">Análisis Completado</CardTitle>
                                <CardDescription>Se han generado {aiEvents.length} clips automáticos.</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>

                {/* Main Area: Player */}
                <div className="lg:col-span-2">
                    {videoUrl ? (
                        <Card className="bg-card border-border h-full">
                            <CardContent className="p-4">
                                <VideoSmartPlayer
                                    src={videoUrl}
                                    events={aiEvents}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/10 text-muted-foreground">
                            <Wand2 className="w-12 h-12 mb-4 opacity-20" />
                            <p>Sube un video para iniciar el análisis inteligente</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
