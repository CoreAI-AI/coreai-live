import { Mic, Square, Pause, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useEffect } from "react";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscriptionComplete, disabled }: VoiceRecorderProps) => {
  const {
    isRecording,
    isPaused,
    transcribing,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    transcribe,
    reset,
  } = useVoiceRecorder();

  const handleStopAndTranscribe = async () => {
    stopRecording();
    const text = await transcribe();
    if (text) {
      onTranscriptionComplete(text);
    }
    reset();
  };

  if (transcribing) {
    return (
      <Button size="sm" variant="ghost" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (isRecording) {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={isPaused ? resumeRecording : pauseRecording}
          className="text-foreground hover:bg-accent"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleStopAndTranscribe}
          className="text-destructive hover:bg-destructive/10"
        >
          <Square className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1 px-2">
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">
            {isPaused ? 'Paused' : 'Recording...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={startRecording}
      disabled={disabled}
      className="text-foreground hover:bg-accent"
      title="Start voice recording (Ctrl+Shift+V)"
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
};