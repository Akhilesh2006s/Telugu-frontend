import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, CheckCircle, X } from "lucide-react";

interface Submission {
  id: string;
  studentName: string;
  milestone?: number;
  voiceRecording?: {
    audioBlob?: string;
    audioUrl?: string;
    duration?: number;
    fileName?: string;
  };
}

interface SimpleVoiceEvaluationInterfaceProps {
  submission: Submission;
  onEvaluate: (evaluation: any) => void;
  onClose: () => void;
}

const SimpleVoiceEvaluationInterface = ({ submission, onEvaluate, onClose }: SimpleVoiceEvaluationInterfaceProps) => {
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const availableTags = ["pronunciation", "tone", "clarity", "speed", "grammar", "confidence"];

  useEffect(() => {
    // Create audio element from submission data
    if (submission.voiceRecording?.audioBlob) {
      try {
        console.log('🎤 Creating audio from blob...');
        const audio = new Audio(`data:audio/wav;base64,${submission.voiceRecording.audioBlob}`);
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('error', (e) => {
          console.error('🎤 Audio blob playback error:', e);
        });
        setAudioElement(audio);
      } catch (error) {
        console.error('🎤 Error creating audio from blob:', error);
      }
    } else if (submission.voiceRecording?.audioUrl) {
      try {
        console.log('🎤 Creating audio from URL...');
        const audio = new Audio(submission.voiceRecording.audioUrl);
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('error', (e) => {
          console.error('🎤 Audio URL playback error:', e);
        });
        setAudioElement(audio);
      } catch (error) {
        console.error('🎤 Error creating audio from URL:', error);
      }
    } else {
      console.log('🎤 No audio data available in submission:', submission.voiceRecording);
    }
  }, [submission.voiceRecording]);

  const handlePlayPause = async () => {
    if (!audioElement) {
      console.log('🎤 No audio element available');
      return;
    }
    
    try {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
        console.log('🎤 Audio paused');
      } else {
        console.log('🎤 Attempting to play audio...');
        await audioElement.play();
        setIsPlaying(true);
        console.log('🎤 Audio playing successfully');
      }
    } catch (error) {
      console.error('🎤 Error playing/pausing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmitEvaluation = () => {
    if (score < 0 || score > 100) {
      alert('Score must be between 0 and 100');
      return;
    }

    const evaluation = {
      score,
      feedback,
      tags
    };
    
    onEvaluate(evaluation);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Voice Recording</h3>
            <p className="text-sm text-muted-foreground">
              {submission.voiceRecording?.fileName || 'Recording'}
              {submission.voiceRecording?.duration && ` • ${formatDuration(submission.voiceRecording.duration)}`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            disabled={!audioElement}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </div>

      {/* Score Input */}
      <div className="space-y-2">
        <Label htmlFor="score">Score (out of 100)</Label>
        <Input
          id="score"
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value) || 0)}
          placeholder="Enter score (0-100)"
          className="w-32"
        />
        <p className="text-sm text-muted-foreground">
          Give a score from 0 to 100 based on pronunciation, clarity, and overall performance
        </p>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Provide constructive feedback and suggestions for improvement..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Button
              key={tag}
              variant={tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => handleAddTag(tag)}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Button>
          ))}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4">
        <Button onClick={handleSubmitEvaluation} className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Submit Evaluation
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SimpleVoiceEvaluationInterface;




