"use client"

import { Label } from "@/components/ui/label"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UploadCloud, ListMusic, Settings2 } from "lucide-react"
import PlaylistView from "./playlist-view"
import VideoPlayerView from "./video-player-view"
import AudioPlayerView from "./audio-player-view"
import MidiPlayerView from "./midi-player-view"
import EffectsPanel from "./effects-panel"
import type { PlaylistItem, VisualSettings } from "@/lib/types"
import { initialVisualSettings, eqBandsDefinition } from "@/lib/media-defaults"

export default function MediaPlayerV1() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)

  const [visualSettings, setVisualSettings] = useState<VisualSettings>(initialVisualSettings)
  const [eqSettings, setEqSettings] = useState<number[]>(Array(eqBandsDefinition.length).fill(0))

  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const eqNodesRef = useRef<BiquadFilterNode[]>([])
  const masterGainNodeRef = useRef<GainNode | null>(null)

  const [globalVolume, setGlobalVolume] = useState(1)

  const currentPlaylistItem = currentTrackIndex !== null ? playlist[currentTrackIndex] : null

  const cleanupAudioNodes = useCallback(() => {
    if (mediaSourceRef.current) {
      try {
        mediaSourceRef.current.disconnect()
      } catch (e) {
        console.warn("Error disconnecting media source:", e)
      }
      mediaSourceRef.current = null
    }
    eqNodesRef.current.forEach((node) => {
      try {
        node.disconnect()
      } catch (e) {
        console.warn("Error disconnecting EQ node:", e)
      }
    })
    eqNodesRef.current = []
  }, [])

  useEffect(() => {
    // Only initialize audio context when actually needed for audio/effects
    return () => {
      cleanupAudioNodes()
      if (masterGainNodeRef.current) {
        try {
          masterGainNodeRef.current.disconnect()
        } catch (e) {
          console.warn("Error disconnecting masterGainNode", e)
        }
        masterGainNodeRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().then(() => {
          console.log("AudioContext closed")
          audioContextRef.current = null
        })
      }
      playlist.forEach((item) => {
        if (item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url)
        }
      })
    }
  }, [cleanupAudioNodes, playlist])

  // Simplified audio processing - only use when explicitly needed
  const setupAudioProcessing = useCallback(
    () => {
      // Skip audio processing for now to ensure videos play properly
      console.log("Audio processing disabled for stability")
    },
    []
  )

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newPlaylistItems: PlaylistItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileUrl = URL.createObjectURL(file)
      const fileExtension = file.name.split(".").pop()?.toLowerCase()
      let type: PlaylistItem["type"] = "unknown"

      if (["mp4", "webm", "ogv", "mkv", "mov", "avi"].includes(fileExtension || "")) type = "video"
      else if (["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(fileExtension || "")) type = "audio"
      else if (["mid", "midi"].includes(fileExtension || "")) type = "midi"

      if (type !== "unknown") {
        newPlaylistItems.push({
          id: `${Date.now()}-${file.name}-${i}`,
          file,
          url: fileUrl,
          type,
          name: file.name,
          duration: 0,
        })
      } else {
        URL.revokeObjectURL(fileUrl)
        console.warn(`Unsupported file type: ${file.name}`)
      }
    }

    setPlaylist((prev) => [...prev, ...newPlaylistItems])
    if (currentTrackIndex === null && newPlaylistItems.length > 0) {
      setCurrentTrackIndex(playlist.length)
    }
    event.target.value = ""
  }

  const playTrack = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentTrackIndex(index)
    }
  }

  const playNext = useCallback(() => {
    if (currentTrackIndex !== null && playlist.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length
      playTrack(nextIndex)
    }
  }, [currentTrackIndex, playlist.length])

  const removeFromPlaylist = (idToRemove: string) => {
    const itemToRemoveIndex = playlist.findIndex((item) => item.id === idToRemove)
    if (itemToRemoveIndex === -1) return

    URL.revokeObjectURL(playlist[itemToRemoveIndex].url)
    const newPlaylist = playlist.filter((item) => item.id !== idToRemove)
    setPlaylist(newPlaylist)

    if (currentTrackIndex === itemToRemoveIndex) {
      if (newPlaylist.length === 0) {
        setCurrentTrackIndex(null)
      } else if (currentTrackIndex >= newPlaylist.length) {
        setCurrentTrackIndex(newPlaylist.length - 1)
      }
    } else if (currentTrackIndex !== null && itemToRemoveIndex < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }

  const updateTrackDuration = (id: string, duration: number) => {
    setPlaylist((prev) => prev.map((track) => (track.id === id ? { ...track, duration } : track)))
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 p-4">
      <Card className="lg:w-1/3 bg-slate-800/90 border-slate-700 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-slate-100 text-lg">
            <ListMusic className="mr-2 h-5 w-5" /> Playlist
          </CardTitle>
          <CardDescription className="text-slate-400">Upload and manage your media files.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="file-upload-v1" className="mb-3 block font-medium text-slate-300">
              Add to Playlist
            </Label>
            <div className="flex items-center space-x-3">
              <Input
                id="file-upload-v1"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="video/*,audio/*,.mid,.midi"
                className="flex-grow bg-slate-700/80 border-slate-600 text-slate-200 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 file:bg-slate-600 file:border-0 file:text-slate-300"
              />
              <UploadCloud className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Supports MP4, WebM, MP3, WAV, OGG, MIDI files</p>
          </div>
          <PlaylistView
            playlist={playlist}
            currentTrackId={currentPlaylistItem?.id}
            onPlayTrack={playTrack}
            onRemoveTrack={removeFromPlaylist}
          />
        </CardContent>
      </Card>

      <div className="lg:w-2/3 flex flex-col gap-6">
        <Card className="flex-grow bg-slate-800/90 border-slate-700 shadow-2xl min-h-[300px] lg:min-h-[500px] backdrop-blur-sm">
          <CardContent className="p-4 h-full flex flex-col">
            {currentPlaylistItem?.type === "video" && (
              <VideoPlayerView
                key={currentPlaylistItem.id}
                item={currentPlaylistItem}
                visualSettings={visualSettings}
                onEnded={playNext}
                setupAudioProcessing={setupAudioProcessing}
                volume={globalVolume}
                onVolumeChange={setGlobalVolume}
                onDurationChange={(duration) => updateTrackDuration(currentPlaylistItem.id, duration)}
                audioContext={audioContextRef.current}
              />
            )}
            {currentPlaylistItem?.type === "audio" && (
              <AudioPlayerView
                key={currentPlaylistItem.id}
                item={currentPlaylistItem}
                onEnded={playNext}
                setupAudioProcessing={setupAudioProcessing}
                volume={globalVolume}
                onVolumeChange={setGlobalVolume}
                onDurationChange={(duration) => updateTrackDuration(currentPlaylistItem.id, duration)}
                audioContext={audioContextRef.current}
              />
            )}
            {currentPlaylistItem?.type === "midi" && (
              <MidiPlayerView
                key={currentPlaylistItem.id}
                item={currentPlaylistItem}
                audioContext={audioContextRef.current}
                masterGainNode={masterGainNodeRef.current}
                onEnded={playNext}
                onDurationChange={(duration) => updateTrackDuration(currentPlaylistItem.id, duration)}
              />
            )}
            {!currentPlaylistItem && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="relative mb-6">
                  <ListMusic className="h-24 w-24 opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-slate-300">Welcome to Media Player</h2>
                <p className="text-lg mb-1">Select a file from the playlist to start playing</p>
                <p className="text-sm opacity-70">or upload new media files to begin</p>
              </div>
            )}
          </CardContent>
        </Card>

        {currentPlaylistItem && currentPlaylistItem.type === "video" && (
          <Card className="bg-slate-800/90 border-slate-700 shadow-2xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-slate-100 text-lg">
                <Settings2 className="mr-2 h-5 w-5" /> Visual Effects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EffectsPanel
                visualSettings={visualSettings}
                onVisualSettingsChange={setVisualSettings}
                eqSettings={eqSettings}
                onEqSettingsChange={setEqSettings}
                disabled={false}
                videoMode={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}