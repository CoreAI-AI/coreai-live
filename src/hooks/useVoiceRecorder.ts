import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
          toast.info('Recording stopped after 60 seconds');
        }
      }, 60000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const transcribe = useCallback(async (): Promise<string> => {
    if (!audioUrl) return '';

    setTranscribing(true);
    try {
      // Try Web Speech API first (browser native)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        return new Promise((resolve) => {
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTranscribing(false);
            resolve(transcript);
          };
          
          recognition.onerror = () => {
            setTranscribing(false);
            toast.error('Transcription failed');
            resolve('');
          };
          
          recognition.start();
        });
      } else {
        toast.info('Browser speech recognition not available');
        setTranscribing(false);
        return '';
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Transcription failed');
      setTranscribing(false);
      return '';
    }
  }, [audioUrl]);

  const reset = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsRecording(false);
    setIsPaused(false);
    setTranscribing(false);
    chunksRef.current = [];
  }, [audioUrl]);

  return {
    isRecording,
    isPaused,
    audioUrl,
    transcribing,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    transcribe,
    reset,
  };
};