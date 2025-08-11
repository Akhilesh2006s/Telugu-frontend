import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Play, Pause, Trash2, Send, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recording {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
}

interface VoiceRecordingProps {
  activityTitle: string;
  teluguTitle: string;
  maxRecordings?: number;
}

const VoiceRecording = ({ 
  activityTitle, 
  teluguTitle, 
  maxRecordings = 5 
}: VoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const newRecording: Recording = {
          id: Date.now().toString(),
          blob: audioBlob,
          duration: recordingTime,
          timestamp: new Date()
        };
        
        setRecordings(prev => [...prev, newRecording]);
        setRecordingTime(0);
        
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Recording Saved",
          description: `Recording ${recordings.length + 1} of ${maxRecordings} saved successfully.`
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = (recording: Recording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    const audioUrl = URL.createObjectURL(recording.blob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.play();
    setPlayingId(recording.id);
    
    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(audioUrl);
    };
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    toast({
      title: "Recording Deleted",
      description: "Recording removed successfully."
    });
  };

  const submitForExam = () => {
    if (!selectedRecording) {
      toast({
        title: "No Recording Selected",
        description: "Please select a recording to submit for exam.",
        variant: "destructive"
      });
      return;
    }

    // Frontend only - submission logic to be handled by backend
    toast({
      title: "Submitted for Exam",
      description: "Your recording has been submitted for evaluation."
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canRecord = recordings.length < maxRecordings;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Recording Practice
        </CardTitle>
        <div className="space-y-1">
          <p className="text-sm font-medium">{activityTitle}</p>
          <p className="text-sm text-primary font-medium">{teluguTitle}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!canRecord && !isRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </div>

          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <Timer className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {recordings.length} of {maxRecordings} recordings saved
          </div>

          <Progress value={(recordings.length / maxRecordings) * 100} className="w-32 mx-auto" />
        </div>

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Your Recordings</h4>
            <div className="space-y-2">
              {recordings.map((recording, index) => (
                <div 
                  key={recording.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRecording === recording.id ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => setSelectedRecording(recording.id)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div className="text-sm">
                      <div className="font-medium">Recording {index + 1}</div>
                      <div className="text-muted-foreground">
                        {formatTime(recording.duration)} • {recording.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playRecording(recording);
                      }}
                    >
                      {playingId === recording.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRecording(recording.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit for Exam */}
        {recordings.length > 0 && (
          <div className="text-center pt-4 border-t">
            <Button 
              onClick={submitForExam}
              disabled={!selectedRecording}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Selected Recording for Exam
            </Button>
            {selectedRecording && (
              <p className="text-sm text-muted-foreground mt-2">
                Recording {recordings.findIndex(r => r.id === selectedRecording) + 1} selected for submission
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecording;