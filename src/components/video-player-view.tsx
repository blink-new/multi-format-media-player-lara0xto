import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react"
import type { PlaylistItem, VisualSettings } from "@/lib/types"

interface VideoPlayerViewProps {
  item: PlaylistItem
  visualSettings: VisualSettings
  onEnded: () => void
  volume: number
  onVolumeChange: (volume: number) => void
  onDurationChange: (duration: number) => void
}

export default function VideoPlayerView({
  item,
  visualSettings,
  onEnded,
  volume,
  onVolumeChange,
  onDurationChange,
}: VideoPlayerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {
        setPlaybackError('Failed to play video. This format may not be supported by your browser.')
      })
    }
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
    setPlaybackError(null)
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
      onDurationChange(video.duration || 0)
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

    const handleError = () => {
      const ext = item.name.split('.').pop()?.toLowerCase()
      if (ext === 'mkv') {
        setPlaybackError('MKV format may not be supported in your browser. Try Chrome/Edge or use MP4/WebM.')
      } else {
        setPlaybackError('Video playback failed. The format may not be supported.')
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)

    video.volume = volume

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
    }
  }, [item.url, onEnded, volume, onDurationChange])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

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
        {playbackError ? (
          <div className="flex items-center justify-center h-full w-full bg-slate-900 text-red-400 text-center p-6">
            <div>
              <div className="text-lg font-semibold mb-2">{playbackError}</div>
              <div className="text-sm text-slate-400 mb-4">File: {item.name}</div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setPlaybackError(null)
                  if (videoRef.current) {
                    videoRef.current.load()
                  }
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={item.url}
            className="w-full h-full object-contain cursor-pointer"
            style={videoStyle}
            onClick={togglePlay}
            controls={false}
            playsInline
            preload="metadata"
          />
        )}
        
        {!playbackError && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <Button
                variant="secondary"
                size="lg"
                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 w-12 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            className="flex-1"
            onValueChange={handleSeek}
            disabled={playbackError !== null}
          />
          <span className="text-xs text-slate-400 w-12">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => skip(-10)}
              disabled={playbackError !== null}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={togglePlay}
              disabled={playbackError !== null}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => skip(10)}
              disabled={playbackError !== null}
            >
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
              className="w-24"
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
