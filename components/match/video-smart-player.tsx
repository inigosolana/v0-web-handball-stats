"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"

interface VideoSmartPlayerProps {
    src: string
    events?: { id: string; time: number; label: string }[]
    onvideoTimeUpdate?: (time: number) => void
    seekTo?: number | null
}

export function VideoSmartPlayer({ src, events = [], onvideoTimeUpdate, seekTo }: VideoSmartPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)

    // Handle external seek requests
    useEffect(() => {
        if (seekTo !== undefined && seekTo !== null && videoRef.current) {
            videoRef.current.currentTime = seekTo
            if (!isPlaying) {
                // Option: Auto-play on seek? Let's assume yes for "Jump to action"
                videoRef.current.play().catch(() => { })
                setIsPlaying(true)
            }
        }
    }, [seekTo])

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime
            setCurrentTime(time)
            if (onvideoTimeUpdate) {
                onvideoTimeUpdate(time)
            }
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    const jumpTo = (time: number) => {
        if (videoRef.current) {
            // Jump 5 seconds before the event to give context
            const targetTime = Math.max(0, time - 5)
            videoRef.current.currentTime = targetTime
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                />

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-2">
                        <Slider
                            value={[currentTime]}
                            max={duration}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlay} className="hover:text-primary">
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsMuted(!isMuted)}>
                                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={1}
                                        step={0.1}
                                        onValueChange={(v: number[]) => { setVolume(v[0]); if (videoRef.current) videoRef.current.volume = v[0] }}
                                        className="w-24"
                                    />
                                </div>
                                <span className="text-sm font-mono">
                                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /
                                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                            <button className="hover:text-primary">
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-Clip Events List */}
            {events.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-bold text-sm text-foreground">Momentos Clave (Auto-Clips)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {events.map((event) => (
                            <Button
                                key={event.id}
                                variant="outline"
                                size="sm"
                                onClick={() => jumpTo(event.time)}
                                className="justify-start gap-2 h-auto py-2 text-xs"
                            >
                                <Play className="w-3 h-3" />
                                <div className="flex flex-col items-start truncate">
                                    <span className="font-bold">{Math.floor(event.time / 60)}:{(event.time % 60).toString().padStart(2, '0')}</span>
                                    <span className="truncate w-full">{event.label}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
