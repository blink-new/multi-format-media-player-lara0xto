import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Piano, SkipBack, SkipForward } from "lucide-react"
import type { PlaylistItem } from "@/lib/types"

interface MidiPlayerViewProps {
  item: PlaylistItem
  audioContext: AudioContext | null
  masterGainNode: GainNode | null
  onEnded: () => void
  onDurationChange: (duration: number) => void
}

export default function MidiPlayerView({
  item,
  audioContext: _audioContext,
  masterGainNode: _masterGainNode,
  onEnded,
  onDurationChange,
}: MidiPlayerViewProps) {
  // Prevent unused variable warnings - these would be used in a full MIDI implementation
  void _audioContext
  void _masterGainNode
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration] = useState(120) // Default 2 minutes for MIDI
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } else {
      setIsPlaying(true)
      // Simple MIDI simulation - in a real implementation, you'd use Web MIDI API
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1
          if (newTime >= duration) {
            setIsPlaying(false)
            onEnded()
            return 0
          }
          return newTime
        })
      }, 1000)
    }
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const skip = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)))
  }

  useEffect(() => {
    onDurationChange(duration)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [duration, onDurationChange])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Visual representation */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg mb-6">
        <div className="text-center">
          <div className="relative mb-6">
            <div className={`w-32 h-32 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 mx-auto ${isPlaying ? 'animate-pulse' : ''}`}>
              <Piano className="h-16 w-16 text-purple-400" />
            </div>
            {isPlaying && (
              <div className="absolute inset-0 w-32 h-32 mx-auto">
                <div className="w-full h-full border-4 border-purple-400/30 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">{item.name}</h3>
          <p className="text-sm text-slate-400">MIDI File</p>
          <p className="text-xs text-slate-500 mt-2">
            Note: Full MIDI playback requires Web MIDI API implementation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 w-12">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            className="flex-1"
            onValueChange={handleSeek}
          />
          <span className="text-xs text-slate-400 w-12">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => skip(-10)}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => skip(10)}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}