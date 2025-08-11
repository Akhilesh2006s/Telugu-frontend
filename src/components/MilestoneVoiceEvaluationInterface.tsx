import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Volume2, 
  Star,
  MessageSquare,
  Tag,
  Award
} from "lucide-react";

interface MilestoneVoiceEvaluationInterfaceProps {
  submission: {
    id: string;
    studentName: string;
    milestone?: number;
    voiceRecording?: {
      audioBlob?: string;
      audioUrl?: string;
      duration?: number;
      fileName?: string;
      transcription?: string;
    };
  };
  onEvaluate: (evaluation: any) => void;
  onClose?: () => void;
}

const MilestoneVoiceEvaluationInterface = ({ 
  submission, 
  onEvaluate, 
  onClose 
}: MilestoneVoiceEvaluationInterfaceProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [score, setScore] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const [clarityScore, setClarityScore] = useState(0);
  const [toneScore, setToneScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const getMilestoneTitle = (milestone: number) => {
    const titles = {
      1: "Telugu Basics - Lesson 1: Vowels (ఆ నుంచి అహ వరకు)",
      2: "Telugu Basics - Lesson 2: Consonants (క నుంచి బండి ర వరకు)",
      3: "Telugu Basics - Lesson 3: Special Characters",
      4: "Telugu Basics - Lesson 4: Guninthalu Method 1",
      5: "Telugu Basics - Lesson 5: Guninthalu Method 2",
      6: "Telugu Basics - Lesson 6: Guninthalu Method 3",
      7: "Telugu Basics - Lesson 7: Three Consonant Combinations",
      8: "Telugu Basics - Lesson 8: Two Consonant Combinations",
      9: "Telugu Basics - Lesson 9: Four Step Method - Stage One",
      10: "Telugu Basics - Lesson 10: Four Step Method - Stage Two",
      11: "Telugu Basics - Lesson 11: Double Letter Words",
      12: "Telugu Basics - Lesson 12: Compound Letter Words",
      13: "Telugu Basics - Lesson 13: Two Double Letter Words",
      14: "Telugu Basics - Lesson 14: Two Compound Letter Words",
      15: "Telugu Basics - Lesson 15: Complex Combination Words",
      16: "Telugu Basics - Lesson 16: Complete Letter Modification",
      17: "Telugu Basics - Lesson 17: హాల్లు ను పూర్తిగా మార్చడం ద్వారా ఒత్తు వచ్చే వాటిని చెప్పగలరా?",
      18: "Telugu Basics - Lesson 18: హాల్లు కు వున్న తలకట్టు తీసివేయడం ద్వారా ఒత్తు వచ్చే వాటిని చెప్పగలరా?",
      19: "Telugu Basics - Lesson 19: హల్లులో ఎలాంటి మార్పు అవసరంలేకుండా ఒత్తు వచ్చే వాటిని చెప్పగలరా?"
    };
    return titles[milestone as keyof typeof titles] || `Lesson ${milestone}`;
  };

  useEffect(() => {
    if (submission.voiceRecording?.audioBlob) {
      try {
        console.log('🎤 Creating audio from base64 blob...');
        // Convert base64 to audio element with proper error handling
        const audio = new Audio(`data:audio/wav;base64,${submission.voiceRecording.audioBlob}`);
        
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('error', (e) => {
          console.error('🎤 Audio playback error:', e);
          console.error('🎤 Audio error details:', audio.error);
        });
        audio.addEventListener('canplaythrough', () => {
          console.log('🎤 Audio loaded successfully');
        });
        
        setAudioElement(audio);
        console.log('🎤 Audio element created successfully');
      } catch (error) {
        console.error('🎤 Error creating audio element:', error);
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

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmitEvaluation = () => {
    const evaluation = {
      score,
      pronunciationScore,
      clarityScore,
      toneScore,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Voice Recording Evaluation
          </CardTitle>
          <CardDescription>
            Evaluate {submission.studentName}'s voice recording for {getMilestoneTitle(submission.milestone || 1)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Player */}
          <div className="space-y-4">
            <Label>Voice Recording</Label>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              {audioElement ? (
                <Button 
                  onClick={handlePlayPause}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled
                >
                  <Volume2 className="w-4 h-4" />
                  No Audio
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                {submission.voiceRecording?.duration 
                  ? formatDuration(submission.voiceRecording.duration)
                  : "Unknown duration"
                }
              </div>
              {submission.voiceRecording?.fileName && (
                <Badge variant="secondary">
                  {submission.voiceRecording.fileName}
                </Badge>
              )}
              {submission.voiceRecording?.audioBlob && (
                <Badge variant="outline" className="text-xs">
                  Base64 Audio Available
                </Badge>
              )}
            </div>
            {/* Debug Info */}
            <div className="text-xs text-muted-foreground">
              <div>Audio Element: {audioElement ? '✅ Created' : '❌ Not Available'}</div>
              <div>Audio Blob: {submission.voiceRecording?.audioBlob ? '✅ Available' : '❌ Not Available'}</div>
              <div>Audio URL: {submission.voiceRecording?.audioUrl ? '✅ Available' : '❌ Not Available'}</div>
            </div>
          </div>

          {/* Transcription */}
          {submission.voiceRecording?.transcription && (
            <div className="space-y-2">
              <Label>Transcription</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                {submission.voiceRecording.transcription}
              </div>
            </div>
          )}

          {/* Scoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="space-y-2">
              <Label htmlFor="overall-score">Overall Score (0-100)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="overall-score"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <Progress value={score} className="w-full" />
            </div>

            {/* Pronunciation Score */}
            <div className="space-y-2">
              <Label htmlFor="pronunciation-score">Pronunciation (0-100)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pronunciation-score"
                  type="number"
                  min="0"
                  max="100"
                  value={pronunciationScore}
                  onChange={(e) => setPronunciationScore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <Progress value={pronunciationScore} className="w-full" />
            </div>

            {/* Clarity Score */}
            <div className="space-y-2">
              <Label htmlFor="clarity-score">Clarity (0-100)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="clarity-score"
                  type="number"
                  min="0"
                  max="100"
                  value={clarityScore}
                  onChange={(e) => setClarityScore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <Progress value={clarityScore} className="w-full" />
            </div>

            {/* Tone Score */}
            <div className="space-y-2">
              <Label htmlFor="tone-score">Tone & Expression (0-100)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tone-score"
                  type="number"
                  min="0"
                  max="100"
                  value={toneScore}
                  onChange={(e) => setToneScore(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <Progress value={toneScore} className="w-full" />
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </Label>
            <Textarea
              id="feedback"
              placeholder="Provide detailed feedback on pronunciation, clarity, tone, and areas for improvement..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button onClick={handleAddTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEvaluation} className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Submit Evaluation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestoneVoiceEvaluationInterface;
