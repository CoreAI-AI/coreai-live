import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useState, useEffect } from "react";

interface VoiceSettingsProps {
  settings: {
    voiceInputEnabled: boolean;
    textToSpeechEnabled: boolean;
    selectedVoice: string;
    speechRate: number;
  };
  onSettingsChange: (settings: any) => void;
}

export const VoiceSettings = ({ settings, onSettingsChange }: VoiceSettingsProps) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance("This is a test of the selected voice.");
    const voice = voices.find(v => v.name === settings.selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = settings.speechRate;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Voice Input</Label>
          <p className="text-sm text-muted-foreground">
            Enable microphone for voice messages
          </p>
        </div>
        <Switch
          checked={settings.voiceInputEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, voiceInputEnabled: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Text-to-Speech</Label>
          <p className="text-sm text-muted-foreground">
            Read AI responses aloud
          </p>
        </div>
        <Switch
          checked={settings.textToSpeechEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, textToSpeechEnabled: checked })
          }
        />
      </div>

      {settings.textToSpeechEnabled && (
        <>
          <div className="space-y-2">
            <Label>Voice Selection</Label>
            <Select
              value={settings.selectedVoice}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, selectedVoice: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Speech Rate: {settings.speechRate}x</Label>
            <Slider
              value={[settings.speechRate]}
              onValueChange={([value]) =>
                onSettingsChange({ ...settings, speechRate: value })
              }
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <Button onClick={testVoice} variant="outline" size="sm" className="w-full">
            <Volume2 className="w-4 h-4 mr-2" />
            Test Voice
          </Button>
        </>
      )}
    </div>
  );
};