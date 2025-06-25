import React, { useRef, useState } from "react";
import { UploadCloud, Play, Pause, ListMusic, Video, Music } from "lucide-react";

// Minimal type
type PlaylistItem = {
  id: string;
  url: string;
  name: string;
  type: "video" | "audio";
};

const font = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
};

export default function App() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [current, setCurrent] = useState<PlaylistItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const items: PlaylistItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase();
      let type: PlaylistItem["type"] = "audio";
      if (["mp4", "webm", "ogv", "mkv", "mov", "avi"].includes(ext || "")) type = "video";
      else if (["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(ext || "")) type = "audio";
      else continue;
      items.push({
        id: `${Date.now()}-${file.name}-${i}`,
        url: URL.createObjectURL(file),
        name: file.name,
        type,
      });
    }
    setPlaylist((prev) => [...prev, ...items]);
    if (!current && items.length > 0) setCurrent(items[0]);
    e.target.value = "";
  }

  function handlePlayPause() {
    if (!current) return;
    if (current.type === "video" && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    } else if (current.type === "audio" && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  }

  function handleSelect(item: PlaylistItem) {
    setCurrent(item);
    setIsPlaying(false);
    setTimeout(() => {
      if (item.type === "video" && videoRef.current) videoRef.current.currentTime = 0;
      if (item.type === "audio" && audioRef.current) audioRef.current.currentTime = 0;
    }, 50);
  }

  function handleEnded() {
    if (!current) return;
    const idx = playlist.findIndex((x) => x.id === current.id);
    if (idx >= 0 && idx < playlist.length - 1) {
      setCurrent(playlist[idx + 1]);
      setIsPlaying(false);
    }
  }

  return (
    <div style={{ ...font, minHeight: "100vh", background: "linear-gradient(120deg,#18181b 0%,#23272f 100%)", color: "#fff" }}>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{letterSpacing: "-0.02em"}}>
          <ListMusic className="inline-block w-8 h-8 text-sky-400" />
          Multi-Format Media Player
        </h1>
        <p className="text-slate-400 mb-8">Upload and play video or audio files. Simple, beautiful, and reliable.</p>
        <div className="flex items-center gap-3 mb-8">
          <label htmlFor="file-upload" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg cursor-pointer border border-slate-700 transition">
            <UploadCloud className="w-5 h-5 text-sky-400" />
            <span className="font-medium">Add Files</span>
            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} accept="video/*,audio/*" />
          </label>
        </div>
        <div className="flex gap-8">
          <div className="w-1/3">
            <div className="mb-2 text-slate-300 font-semibold">Playlist</div>
            <ul className="space-y-2">
              {playlist.length === 0 && <li className="text-slate-500 text-sm">No files yet.</li>}
              {playlist.map((item) => (
                <li key={item.id} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition ${current?.id === item.id ? "bg-sky-900/40" : "hover:bg-slate-700/40"}`} onClick={() => handleSelect(item)}>
                  {item.type === "video" ? <Video className="w-4 h-4 text-sky-400" /> : <Music className="w-4 h-4 text-pink-400" />}
                  <span className="truncate flex-1">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-slate-900 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[320px] p-4">
              {!current && <div className="text-slate-500 text-lg flex flex-col items-center justify-center h-full"><Play className="w-12 h-12 mb-2 opacity-30" />Select a file to play</div>}
              {current?.type === "video" && (
                <video
                  ref={videoRef}
                  src={current.url}
                  className="w-full max-h-[360px] rounded-lg border border-slate-800 bg-black"
                  controls
                  autoPlay={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleEnded}
                  style={{boxShadow: "0 4px 32px #0004"}}
                />
              )}
              {current?.type === "audio" && (
                <audio
                  ref={audioRef}
                  src={current.url}
                  className="w-full mt-8"
                  controls
                  autoPlay={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleEnded}
                />
              )}
            </div>
            {current && (
              <button
                className="mt-6 px-6 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-lg shadow transition flex items-center gap-2"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
