import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, X, Music, Video, Piano } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PlaylistItem } from "@/lib/types"

interface PlaylistViewProps {
  playlist: PlaylistItem[]
  currentTrackId?: string
  onPlayTrack: (index: number) => void
  onRemoveTrack: (id: string) => void
}

export default function PlaylistView({
  playlist,
  currentTrackId,
  onPlayTrack,
  onRemoveTrack,
}: PlaylistViewProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTypeIcon = (type: PlaylistItem['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'midi':
        return <Piano className="h-4 w-4" />
      default:
        return <Music className="h-4 w-4" />
    }
  }

  if (playlist.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No tracks in playlist</p>
        <p className="text-sm">Upload some files to get started</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] w-full">
      <div className="space-y-2">
        {playlist.map((track, index) => (
          <div
            key={track.id}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 transition-colors group",
              currentTrackId === track.id && "bg-sky-600/30 border-sky-500"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8 hover:bg-sky-500/20"
              onClick={() => onPlayTrack(index)}
            >
              {currentTrackId === track.id ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="text-slate-400">
                {getTypeIcon(track.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {track.name}
                </p>
                <p className="text-xs text-slate-500">
                  {track.duration > 0 ? formatDuration(track.duration) : '--:--'}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
              onClick={() => onRemoveTrack(track.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}