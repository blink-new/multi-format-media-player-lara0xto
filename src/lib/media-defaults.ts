import type { VisualSettings, EQBand } from './types'

export const initialVisualSettings: VisualSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
}

export const eqBandsDefinition: EQBand[] = [
  { type: 'peaking', f: 60, label: '60Hz' },
  { type: 'peaking', f: 170, label: '170Hz' },
  { type: 'peaking', f: 310, label: '310Hz' },
  { type: 'peaking', f: 600, label: '600Hz' },
  { type: 'peaking', f: 1000, label: '1kHz' },
  { type: 'peaking', f: 3000, label: '3kHz' },
  { type: 'peaking', f: 6000, label: '6kHz' },
  { type: 'peaking', f: 12000, label: '12kHz' },
  { type: 'peaking', f: 14000, label: '14kHz' },
  { type: 'peaking', f: 16000, label: '16kHz' },
]