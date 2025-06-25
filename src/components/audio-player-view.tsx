import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music } from "lucide-react"
import type { PlaylistItem } from "@/lib/types"

interface AudioPlayerViewProps {
  item: PlaylistItem
  onEnded: () => void
  setupAudioProcessing: (element: HTMLMediaElement) => void
  volume: number
  onVolumeChange: (volume: number) => void
  onDurationChange: (duration: number) => void
  audioContext: AudioContext | null;
}

export default function AudioPlayerView({
  item,
  onEnded,
  setupAudioProcessing,
  volume,
  onVolumeChange,
  onDurationChange,
  audioContext,
}: AudioPlayerViewProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          audioRef.current?.play()
        }).catch(error => {
          console.error("Error resuming audio context:", error);
        });
      } else {
        audioRef.current.play()
      }
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, audioContext])

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    onVolumeChange(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted
      setIsMuted(newMuted)
      if (newMuted) {
        audioRef.current.volume = 0
        onVolumeChange(0)
      } else {
        audioRef.current.volume = volume
        onVolumeChange(volume)
      }
    }
  }

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
      onDurationChange(audio.duration || 0)
      setupAudioProcessing(audio)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded()
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Set initial volume
    audio.volume = volume

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [item.url, onEnded, setupAudioProcessing, volume, onDurationChange, item])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isMuted) {
        audioRef.current.volume = 0;
      }
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      <audio ref={audioRef} src={item.url} />
      
      {/* Visual representation */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-6">
        <div className="text-center">
          <div className="relative mb-6">
            <div className={`w-32 h-32 bg-sky-500/20 rounded-full flex items-center justify-center mb-4 mx-auto ${isPlaying ? 'animate-pulse' : ''}`}>
              <Music className="h-16 w-16 text-sky-400" />
            </div>
            {isPlaying && (
              <div className="absolute inset-0 w-32 h-32 mx-auto">
                <div className="w-full h-full border-4 border-sky-400/30 rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">{item.name}</h3>
          <p className="text-sm text-slate-400">Audio Track</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 w-12">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            className="flex-1"
            onValueChange={handleSeek}
          />
          <span className="text-xs text-slate-400 w-12">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              className="w-20"
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}