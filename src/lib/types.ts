export interface PlaylistItem {
  id: string
  file: File
  url: string
  type: 'video' | 'audio' | 'midi' | 'unknown'
  name: string
  duration: number
}

export interface VisualSettings {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
}

export interface EQBand {
  type: BiquadFilterType
  f: number
  label: string
}