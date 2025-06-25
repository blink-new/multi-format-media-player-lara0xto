import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react"
import type { PlaylistItem, VisualSettings } from "@/lib/types"

interface VideoPlayerViewProps {
  item: PlaylistItem
  visualSettings: VisualSettings
  onEnded: () => void
  setupAudioProcessing: (element: HTMLMediaElement) => void
  volume: number
  onVolumeChange: (volume: number) => void
  onDurationChange: (duration: number) => void
}

export default function VideoPlayerView({
  item,
  visualSettings,
  onEnded,
  setupAudioProcessing,
  volume,
  onVolumeChange,
  onDurationChange,
}: VideoPlayerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    onVolumeChange(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted
      setIsMuted(newMuted)
      if (newMuted) {
        videoRef.current.volume = 0
        onVolumeChange(0)
      } else {
        videoRef.current.volume = volume
        onVolumeChange(volume)
      }
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
      onDurationChange(video.duration || 0)
      setupAudioProcessing(video)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded()
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    // Attempt to play when the item changes
    video.play().catch(error => {
      console.error("Error attempting to play video:", error);
      // Handle autoplay policy here if needed, e.g., show a play button
    });

    // Set initial volume
    video.volume = volume

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [item.url, onEnded, setupAudioProcessing, volume, onDurationChange, item])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      if (isMuted) {
        videoRef.current.volume = 0;
      }
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const videoStyle = {
    filter: `
      brightness(${visualSettings.brightness}%)
      contrast(${visualSettings.contrast}%)
      saturate(${visualSettings.saturation}%)
      hue-rotate(${visualSettings.hue}deg)
      blur(${visualSettings.blur}px)
    `.trim()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4 relative group">
        <video
          ref={videoRef}
          src={item.url}
          className="w-full h-full object-contain"
          style={videoStyle}
          onClick={togglePlay}
        />
        
        {/* Overlay controls */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="secondary"
            size="lg"
            className="bg-black/50 hover:bg-black/70"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
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