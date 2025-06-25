import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw } from "lucide-react"
import type { VisualSettings } from "@/lib/types"
import { eqBandsDefinition, initialVisualSettings } from "@/lib/media-defaults"

interface EffectsPanelProps {
  visualSettings: VisualSettings
  onVisualSettingsChange: (settings: VisualSettings) => void
  eqSettings: number[]
  onEqSettingsChange: (settings: number[]) => void
  disabled: boolean
  videoMode: boolean
}

export default function EffectsPanel({
  visualSettings,
  onVisualSettingsChange,
  eqSettings,
  onEqSettingsChange,
  disabled,
  videoMode,
}: EffectsPanelProps) {
  const handleVisualChange = (property: keyof VisualSettings, value: number[]) => {
    onVisualSettingsChange({
      ...visualSettings,
      [property]: value[0],
    })
  }

  const handleEqChange = (index: number, value: number[]) => {
    const newEqSettings = [...eqSettings]
    newEqSettings[index] = value[0]
    onEqSettingsChange(newEqSettings)
  }

  const resetVisualSettings = () => {
    onVisualSettingsChange(initialVisualSettings)
  }

  const resetEqSettings = () => {
    onEqSettingsChange(Array(eqBandsDefinition.length).fill(0))
  }

  return (
    <Tabs defaultValue="equalizer" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-slate-700">
        <TabsTrigger value="equalizer" className="data-[state=active]:bg-slate-600">
          Equalizer
        </TabsTrigger>
        {videoMode && (
          <TabsTrigger value="visual" className="data-[state=active]:bg-slate-600">
            Visual Effects
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="equalizer" className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <Label className="text-slate-300 font-medium">Audio Equalizer</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetEqSettings}
            className="text-slate-400 hover:text-slate-200"
            disabled={disabled}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {eqBandsDefinition.map((band, index) => (
            <div key={band.label} className="space-y-2">
              <Label className="text-xs text-slate-400 text-center block">
                {band.label}
              </Label>
              <div className="h-32 flex items-end justify-center">
                <Slider
                  orientation="vertical"
                  value={[eqSettings[index]]}
                  min={-12}
                  max={12}
                  step={0.5}
                  className="h-full"
                  onValueChange={(value) => handleEqChange(index, value)}
                  disabled={disabled}
                />
              </div>
              <div className="text-xs text-slate-500 text-center">
                {eqSettings[index] >= 0 ? '+' : ''}{eqSettings[index].toFixed(1)}dB
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {videoMode && (
        <TabsContent value="visual" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300 font-medium">Visual Effects</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetVisualSettings}
              className="text-slate-400 hover:text-slate-200"
              disabled={disabled}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">
                Brightness: {visualSettings.brightness}%
              </Label>
              <Slider
                value={[visualSettings.brightness]}
                min={50}
                max={150}
                step={1}
                onValueChange={(value) => handleVisualChange('brightness', value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">
                Contrast: {visualSettings.contrast}%
              </Label>
              <Slider
                value={[visualSettings.contrast]}
                min={50}
                max={150}
                step={1}
                onValueChange={(value) => handleVisualChange('contrast', value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">
                Saturation: {visualSettings.saturation}%
              </Label>
              <Slider
                value={[visualSettings.saturation]}
                min={0}
                max={200}
                step={1}
                onValueChange={(value) => handleVisualChange('saturation', value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">
                Hue: {visualSettings.hue}°
              </Label>
              <Slider
                value={[visualSettings.hue]}
                min={-180}
                max={180}
                step={1}
                onValueChange={(value) => handleVisualChange('hue', value)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm text-slate-300">
                Blur: {visualSettings.blur}px
              </Label>
              <Slider
                value={[visualSettings.blur]}
                min={0}
                max={10}
                step={0.1}
                onValueChange={(value) => handleVisualChange('blur', value)}
                disabled={disabled}
              />
            </div>
          </div>
        </TabsContent>
      )}
    </Tabs>
  )
}