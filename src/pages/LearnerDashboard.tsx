import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Mic, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle,
  Play,
  Calendar,
  TrendingUp,
  Target,
  GraduationCap,
  Sparkles,
  Star,
  Trophy,
  Heart,
  Pause,
  Volume2,
  Maximize,
  LogOut,
  MicOff,
  Timer,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MilestoneSystem from "@/components/MilestoneSystem";
import VoiceRecording from "@/components/VoiceRecording";
import WordPuzzle from "@/components/WordPuzzle";
import ExamInterface from "@/components/ExamInterface";
import DescriptiveExamInterface from "@/components/DescriptiveExamInterface";
import DescriptiveResultsView from "@/components/DescriptiveResultsView";
import YouTubePlayer from "@/components/YouTubePlayer";
import { isYouTubeUrl } from "@/utils/youtubeUtils";
import { getVideoUrl } from "@/utils/videoUtils";

interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
}

interface MilestoneRecording {
  id: string;
  milestone: number;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
  status: "draft" | "submitted";
  isWordPuzzle?: boolean;
  wordPuzzleData?: any;
}

interface ExamResults {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, number>;
  voiceRecordings: Record<string, VoiceRecording>;
  timeSpent: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  type: "mcq" | "voice" | "mixed" | "descriptive";
  timeLimit: number;
  isCompleted: boolean;
  score?: number;
  dueDate?: Date;
  milestone?: number;
  category?: string;
  difficulty?: string;
  passingScore?: number;
  createdAt?: Date;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  cannotRetake?: boolean;
  openDate?: string;
  descriptiveTimeLimit?: number;
  totalMaxMarks?: number;
  // Exam attempt properties (added dynamically)
  attemptId?: string;
  attemptStartedAt?: string;
  attemptTimeLimit?: number;
  attemptRemainingTime?: number;
  mcqQuestions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    points?: number;
  }>;
  voiceQuestions?: Array<{
    question: string;
    targetWords: string[];
    sampleAudioUrl?: string;
    instructions: string;
    points?: number;
  }>;
  descriptiveQuestions?: Array<{
    question: string;
    instructions: string;
    maxPoints: number;
    wordLimit?: number;
  }>;
}

interface LearningActivity {
  id: string;
  title: string;
  teluguTitle: string;
  type: "video" | "practice" | "assessment";
  duration: number;
  isCompleted: boolean;
  progress: number;
}

const LearnerDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showExam, setShowExam] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("curriculum");
  const [showVideoContent, setShowVideoContent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [currentMilestone, setCurrentMilestone] = useState<number>(1);
  const [milestoneRecordings, setMilestoneRecordings] = useState<MilestoneRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [submittingRecordings, setSubmittingRecordings] = useState<Set<string>>(new Set());

  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionDetails, setSubmissionDetails] = useState<Record<string, any>>({});
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [videoLectures, setVideoLectures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("all");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);



  // Check user role and redirect if not a learner
  useEffect(() => {
    if (user && user.role !== 'learner') {
      console.log(`Access denied: User role ${user.role} cannot access learner dashboard`);
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the Learner Dashboard.",
        variant: "destructive"
      });
      
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 'trainer':
          navigate('/trainer');
          break;
        case 'evaluator':
          navigate('/evaluator');
          break;
        default:
          navigate('/');
      }
      return;
    }
  }, [user, navigate, toast]);

  // Define fetchExams and fetchSubmissions functions in component scope
  const fetchExams = async () => {
    if (isLoading) {
      console.log('LearnerDashboard - Skipping fetchExams, already loading...');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('LearnerDashboard - Fetching exams...');
      
      // Fetch exams
      const examResponse = await fetch('https://backend-production-7e4df.up.railway.app/api/exams/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('telugu-basics-token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('LearnerDashboard - Exams response status:', examResponse.status);

      if (examResponse.ok) {
        const examResult = await examResponse.json();
        console.log('LearnerDashboard - Exams result:', examResult);
        
        if (examResult.success) {
          console.log('LearnerDashboard - Raw exam data from backend:', examResult.data);
          
          // Also fetch submissions to get scores
          console.log('LearnerDashboard - Fetching submissions for scores...');
          const submissionResponse = await fetch('https://backend-production-7e4df.up.railway.app/api/submissions/student', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('telugu-basics-token')}`,
              'Content-Type': 'application/json'
            }
          });

          let submissionData: any[] = [];
          if (submissionResponse.ok) {
            const submissionResult = await submissionResponse.json();
            console.log('LearnerDashboard - Submissions result:', submissionResult);
            if (submissionResult.success) {
              submissionData = submissionResult.data;
            }
          }

          // Create a map of exam scores from submissions
          const examScores: Record<string, { score: number; status: string; isCompleted: boolean }> = {};
          submissionData.forEach((submission: any) => {
            const examId = submission.examId || (submission.exam && submission.exam._id);
            if (examId) {
              examScores[examId] = {
                score: submission.score || 0,
                status: submission.status || 'pending',
                isCompleted: submission.status === 'evaluated' || submission.status === 'completed'
              };
            }
          });

          console.log('LearnerDashboard - Exam scores from submissions:', examScores);
          
          // Transform the exam data to match our interface
          const transformedExams = examResult.data.map((exam: any) => {
            console.log('LearnerDashboard - Processing exam:', exam.title, 'descriptiveQuestions:', exam.descriptiveQuestions);
            
            const examScore = examScores[exam._id];
            console.log('LearnerDashboard - Exam score data for', exam.title, ':', examScore);
            
            return {
              id: exam._id || exam.id,
              title: exam.title,
              description: exam.description,
              type: exam.type,
              timeLimit: exam.timeLimit,
              isCompleted: examScore?.isCompleted || exam.isCompleted || false,
              score: examScore?.score || exam.score || undefined,
              dueDate: exam.dueDate,
              milestone: exam.milestone,
              category: exam.category,
              difficulty: exam.difficulty,
              passingScore: exam.passingScore,
              createdAt: exam.createdAt,
              createdBy: exam.createdBy,
              cannotRetake: examScore?.isCompleted || exam.cannotRetake || exam.isCompleted,
              openDate: exam.openDate,
              descriptiveTimeLimit: exam.descriptiveTimeLimit,
              totalMaxMarks: exam.totalMaxMarks || 100,
              mcqQuestions: exam.mcqQuestions || [],
              voiceQuestions: exam.voiceQuestions || [],
              descriptiveQuestions: exam.descriptiveQuestions || []
            };
          });
          
          console.log('LearnerDashboard - Transformed exams with scores:', transformedExams);
          setExams(transformedExams);
        }
      } else {
        // Debug: Log error response
        const errorText = await examResponse.text();
        console.error('LearnerDashboard - Exams error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // Debug: Log the current user and token
      console.log('LearnerDashboard - Current user:', user);
      console.log('LearnerDashboard - User role:', user?.role);
      console.log('LearnerDashboard - Token:', localStorage.getItem('telugu-basics-token'));
      
      const response = await fetch('https://backend-production-7e4df.up.railway.app/api/submissions/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('telugu-basics-token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('LearnerDashboard - Submissions response status:', response.status);
      console.log('LearnerDashboard - Submissions response:', response);

      if (response.ok) {
        const result = await response.json();
        console.log('LearnerDashboard - Submissions result:', result);
        if (result.success) {
          setSubmissions(result.data);
          
          // Store submission details for results viewing
          const submissionDetailsMap: Record<string, any> = {};
          result.data.forEach((submission: any) => {
            const examId = submission.examId || (submission.exam && submission.exam._id);
            if (examId) {
              submissionDetailsMap[examId] = submission;
            }
          });
          setSubmissionDetails(submissionDetailsMap);
          
          // Update exam completion status based on submissions
          setExams(prevExams => 
            prevExams.map(exam => {
              const submission = result.data.find((s: any) => 
                (s.examId === exam.id || (s.exam && s.exam._id === exam.id)) && s.status === 'evaluated'
              );
              
              if (submission) {
                return {
                  ...exam,
                  isCompleted: true,
                  score: submission.score || submission.calculatedScore || 0
                };
              }
              return exam;
            })
          );
        }
      } else {
        // Debug: Log error response
        const errorText = await response.text();
        console.error('LearnerDashboard - Submissions error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const fetchVideoLectures = async () => {
    try {
      console.log('🎬 LearnerDashboard - Fetching video lectures...');
      const response = await fetch('https://backend-production-7e4df.up.railway.app/api/video-lectures/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('telugu-basics-token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🎬 Video lectures response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🎬 Video lectures API result:', result);
        
        if (result.success) {
          console.log('🎬 Video lectures loaded:', result.data);
          setVideoLectures(result.data);
        } else {
          console.error('🎬 Video lectures error:', result.message);
        }
      } else {
        console.error('🎬 Video lectures response not ok:', response.status);
        const errorText = await response.text();
        console.error('🎬 Error details:', errorText);
      }
    } catch (error) {
      console.error('🎬 Error fetching video lectures:', error);
    }
  };

  // Fetch exams from the server (only if user is a learner)
  useEffect(() => {
    if (user && user.role === 'learner' && !hasLoaded) {
      // Add a small delay to prevent rapid requests
      const timer = setTimeout(() => {
        fetchExams();
        fetchSubmissions();
        fetchVideoLectures();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, hasLoaded]);

  // Refresh data periodically to get updated evaluation results
  useEffect(() => {
    if (user && user.role === 'learner') {
      const refreshInterval = setInterval(() => {
        fetchSubmissions();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [user]);
  
  // Load existing voice recordings from backend and localStorage backup
  const loadVoiceRecordings = async () => {
    try {
      console.log('🎤 Loading existing voice recordings...');
      
      // Try to load from backend first
      try {
        const token = localStorage.getItem('telugu-basics-token');
        if (!token) {
          console.log('🎤 No auth token available, skipping backend load');
          return;
        }
        
        const response = await fetch('https://backend-production-7e4df.up.railway.app/api/submissions/student', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          const voiceSubmissions = result.data.filter((sub: any) => 
            (sub.submissionType === 'voice' && sub.type === 'milestone') ||
            (sub.wordPuzzle && sub.type === 'milestone') // Include word puzzle submissions
          );
          
          console.log('🎤 Found voice submissions from backend:', voiceSubmissions.length);
          
          // Convert backend submissions to local recordings format
          const loadedRecordings: MilestoneRecording[] = voiceSubmissions.map((sub: any) => ({
            id: sub._id,
            milestone: sub.milestone,
            blob: new Blob([], { type: 'audio/wav' }), // Placeholder blob
            url: '', // Will be recreated if needed
            duration: sub.voiceRecording?.duration || (sub.wordPuzzle ? 0 : 0),
            timestamp: new Date(sub.submittedAt),
            status: sub.status === 'pending' ? 'draft' : 'submitted',
            isWordPuzzle: !!sub.wordPuzzle,
            wordPuzzleData: sub.wordPuzzle
          }));
          
          console.log('🎤 Loaded recordings from backend:', loadedRecordings);
          
          // Also load from localStorage backup and merge
          try {
            const backupRecordings = JSON.parse(localStorage.getItem('voice-recordings-backup') || '[]');
            console.log('🎤 Found backup recordings in localStorage:', backupRecordings.length);
            
            // Filter out invalid recordings from localStorage
            const validBackupRecordings = filterInvalidRecordings(backupRecordings);
            console.log('🎤 Valid backup recordings after filtering:', validBackupRecordings.length, 'out of', backupRecordings.length);
            
            if (validBackupRecordings.length > 0) {
              const backupRecordingsFormatted: MilestoneRecording[] = validBackupRecordings.map((rec: any) => ({
                id: rec.id || `backup-${Date.now()}-${Math.random()}`,
                milestone: rec.milestone,
                blob: new Blob([], { type: 'audio/wav' }), // Placeholder blob
                url: '', // Will be recreated if needed
                duration: rec.duration || 0,
                timestamp: new Date(rec.timestamp),
                status: 'draft' as const
              }));
              
              console.log('🎤 Loaded backup recordings:', backupRecordingsFormatted);
              
              // Merge and deduplicate recordings
              const allRecordings = [...loadedRecordings, ...backupRecordingsFormatted];
              
              // More robust deduplication: check by milestone and timestamp (within 5 seconds)
              const uniqueRecordings = allRecordings.filter((recording, index, self) => {
                const duplicateIndex = self.findIndex(r => {
                  // Check if same milestone and similar timestamp (within 5 seconds)
                  const timeDiff = Math.abs(r.timestamp.getTime() - recording.timestamp.getTime());
                  return r.milestone === recording.milestone && timeDiff < 5000;
                });
                return index === duplicateIndex;
              });
              
              console.log('🎤 Total unique recordings after merge:', uniqueRecordings.length);
              setMilestoneRecordings(uniqueRecordings);
            } else {
              setMilestoneRecordings(loadedRecordings);
            }
          } catch (localStorageError) {
            console.error('🎤 Error loading from localStorage:', localStorageError);
            setMilestoneRecordings(loadedRecordings);
          }
        } else {
          console.log('🎤 No voice recordings found in backend or server error:', response.status);
          
          // Load only from localStorage if backend fails
          try {
            const backupRecordings = JSON.parse(localStorage.getItem('voice-recordings-backup') || '[]');
            console.log('🎤 Found backup recordings in localStorage:', backupRecordings.length);
            
            // Filter out invalid recordings from localStorage
            const validBackupRecordings = filterInvalidRecordings(backupRecordings);
            console.log('🎤 Valid backup recordings after filtering:', validBackupRecordings.length, 'out of', backupRecordings.length);
            
            if (validBackupRecordings.length > 0) {
              const backupRecordingsFormatted: MilestoneRecording[] = validBackupRecordings.map((rec: any) => ({
                id: rec.id || `backup-${Date.now()}-${Math.random()}`,
                milestone: rec.milestone,
                blob: new Blob([], { type: 'audio/wav' }), // Placeholder blob
                url: '', // Will be recreated if needed
                duration: rec.duration || 0,
                timestamp: new Date(rec.timestamp),
                status: 'draft' as const
              }));
              
              console.log('🎤 Setting backup recordings:', backupRecordingsFormatted);
              setMilestoneRecordings(backupRecordingsFormatted);
            }
          } catch (localStorageError) {
            console.error('🎤 Error loading from localStorage:', localStorageError);
          }
        }
      } catch (backendError) {
        console.error('🎤 Error loading from backend:', backendError);
        console.log('🎤 Will rely on localStorage backup');
        
        // Load only from localStorage if backend fails
        try {
          const backupRecordings = JSON.parse(localStorage.getItem('voice-recordings-backup') || '[]');
          console.log('🎤 Found backup recordings in localStorage:', backupRecordings.length);
          
          // Filter out invalid recordings from localStorage
          const validBackupRecordings = filterInvalidRecordings(backupRecordings);
          console.log('🎤 Valid backup recordings after filtering:', validBackupRecordings.length, 'out of', backupRecordings.length);
          
          if (validBackupRecordings.length > 0) {
            const backupRecordingsFormatted: MilestoneRecording[] = validBackupRecordings.map((rec: any) => ({
              id: rec.id || `backup-${Date.now()}-${Math.random()}`,
              milestone: rec.milestone,
              blob: new Blob([], { type: 'audio/wav' }), // Placeholder blob
              url: '', // Will be recreated if needed
              duration: rec.duration || 0,
              timestamp: new Date(rec.timestamp),
              status: 'draft' as const
            }));
            
            console.log('🎤 Setting backup recordings:', backupRecordingsFormatted);
            setMilestoneRecordings(backupRecordingsFormatted);
          }
        } catch (localStorageError) {
          console.error('🎤 Error loading from localStorage:', localStorageError);
        }
      }
      
    } catch (error) {
      console.error('🎤 Error loading voice recordings:', error);
    }
  };
  
  // Single useEffect to load voice recordings
  useEffect(() => {
    if (user && user.role === 'learner') {
      console.log('🎤 User loaded, loading voice recordings...');
      loadVoiceRecordings();
      
      // Immediately clean up any invalid recordings after loading
      setTimeout(() => {
        console.log('🎤 Running immediate cleanup of invalid recordings...');
        setMilestoneRecordings(prev => {
          const validRecordings = prev.filter(recording => {
            if (recording.duration < 1) {
              console.log('🎤 Removing 0-duration recording:', recording.id);
              return false;
            }
            return true;
          });
          console.log('🎤 Immediate cleanup complete. Valid recordings:', validRecordings.length);
          return validRecordings;
        });
      }, 1000); // Wait 1 second for loading to complete
    }
  }, [user]);

  // Function to generate unique keys for list items
  const generateUniqueKey = (prefix: string, id?: string, index?: number) => {
    if (id) return `${prefix}-${id}`;
    if (index !== undefined) return `${prefix}-${index}-${Date.now()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Clear duplicate recordings on component mount
  useEffect(() => {
    console.log('🎤 Clearing duplicate recordings...');
    setMilestoneRecordings(prev => {
      const uniqueRecordings = prev.filter((recording, index, self) => 
        index === self.findIndex(r => r.id === recording.id)
      );
      console.log('🎤 Removed duplicates, unique recordings:', uniqueRecordings.length);
      return uniqueRecordings;
    });
  }, []);

  // Ensure all recordings have unique IDs
  useEffect(() => {
    setMilestoneRecordings(prev => {
      return prev.map((recording, index) => ({
        ...recording,
        id: recording.id || generateUniqueKey('recording', undefined, index)
      }));
    });
  }, []);

  // Function to clear all recordings (for debugging)
  const clearAllRecordings = () => {
    console.log('🎤 Clearing all recordings...');
    setMilestoneRecordings([]);
    localStorage.removeItem('voice-recordings-backup');
    console.log('🎤 All recordings cleared');
  };

  // Emergency cleanup function - available in console
  const emergencyCleanup = () => {
    console.log('🚨 EMERGENCY CLEANUP: Removing all recordings...');
    setMilestoneRecordings([]);
    localStorage.removeItem('voice-recordings-backup');
    console.log('🚨 Emergency cleanup complete - all recordings removed');
    toast({
      title: "Emergency Cleanup Complete",
      description: "All recordings have been completely removed.",
    });
  };

  // Make emergency cleanup available globally
  useEffect(() => {
    (window as any).emergencyCleanup = emergencyCleanup;
    console.log('🚨 Emergency cleanup function available: window.emergencyCleanup()');
  }, []);

  // Function to clear localStorage backup only
  const clearLocalStorageBackup = () => {
    console.log('🎤 Clearing localStorage backup...');
    localStorage.removeItem('voice-recordings-backup');
    console.log('🎤 localStorage backup cleared');
  };

  // Helper function to filter out invalid recordings
  const filterInvalidRecordings = (recordings: any[]): any[] => {
    return recordings.filter((rec: any) => {
      const duration = rec.duration || 0;
      const isValid = duration >= 1; // Only keep recordings with at least 1 second
      if (!isValid) {
        console.log('🎤 Filtering out invalid recording:', rec.id, 'duration:', duration);
      }
      return isValid;
    });
  };

  const cleanupInvalidRecordings = () => {
    console.log('🎤 Cleaning up invalid recordings...');
    
    // First, clean up localStorage backup completely
    try {
      console.log('🎤 Clearing all localStorage backup recordings...');
      localStorage.removeItem('voice-recordings-backup');
      console.log('🎤 localStorage backup completely cleared');
    } catch (error) {
      console.error('🎤 Error clearing localStorage backup:', error);
    }
    
    // Then clean up memory
    setMilestoneRecordings(prev => {
      const validRecordings = prev.filter(recording => {
        // Remove recordings with 0 duration or invalid data
        if (recording.duration < 1 || recording.blob.size < 100) {
          console.log('🎤 Removing invalid recording:', recording.id, 'duration:', recording.duration, 'size:', recording.blob.size);
          return false;
        }
        return true;
      });
      console.log('🎤 Cleaned up recordings. Valid recordings remaining:', validRecordings.length);
      return validRecordings;
    });
    
    toast({
      title: "Cleanup Complete",
      description: "All invalid recordings have been completely removed from memory and localStorage.",
    });
  };

  const startRecording = async () => {
    // Check if we already have 5 recordings for this milestone
    const milestoneRecordingsCount = milestoneRecordings.filter(r => r.milestone === currentMilestone).length;
    if (milestoneRecordingsCount >= 5) {
      toast({
        title: "Recording Limit Reached",
        description: `You can only have 5 recordings per milestone. Please delete an existing recording first.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        console.log('🎤 MediaRecorder stopped, creating recording...');
        console.log('🎤 Audio chunks count:', audioChunksRef.current.length);
        console.log('🎤 Recording time:', recordingTime);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('🎤 Audio blob created, size:', audioBlob.size);
        
        // Check if recording has minimum duration (at least 1 second)
        if (recordingTime < 1) {
          console.log('🎤 Recording too short, discarding:', recordingTime, 'seconds');
          toast({
            title: "Recording Too Short",
            description: "Please record for at least 1 second.",
            variant: "destructive"
          });
          setRecordingTime(0);
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        const newRecording: MilestoneRecording = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          milestone: currentMilestone,
          blob: audioBlob,
          url: URL.createObjectURL(audioBlob),
          duration: recordingTime,
          timestamp: new Date(),
          status: "draft"
        };
        
        console.log('🎤 New recording created:', {
          id: newRecording.id,
          milestone: newRecording.milestone,
          duration: newRecording.duration,
          blobSize: newRecording.blob.size
        });
        
        // Check if we have 5 recordings for this milestone
        const milestoneRecordingsCount = milestoneRecordings.filter(r => r.milestone === currentMilestone).length;
        console.log('🎤 Current milestone recordings count:', milestoneRecordingsCount);
        
        if (milestoneRecordingsCount >= 5) {
          // Remove the oldest recording for this milestone
          setMilestoneRecordings(prev => {
            const milestoneRecs = prev.filter(r => r.milestone === currentMilestone);
            const oldestRecording = milestoneRecs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
            console.log('🎤 Removing oldest recording:', oldestRecording.id);
            return prev.filter(r => r.id !== oldestRecording.id);
          });
          
          // Wait for state update before adding new recording
          setTimeout(() => {
            setMilestoneRecordings(prev => {
              const newRecordings = [...prev, newRecording];
              console.log('🎤 Updated milestone recordings count:', newRecordings.length);
              return newRecordings;
            });
          }, 0);
        } else {
          setMilestoneRecordings(prev => {
            // Check if recording with this ID already exists
            const existingRecording = prev.find(r => r.id === newRecording.id);
            if (existingRecording) {
              console.log('🎤 Recording already exists, not adding duplicate:', newRecording.id);
              return prev;
            }
            
            const newRecordings = [...prev, newRecording];
            console.log('🎤 Updated milestone recordings count:', newRecordings.length);
            return newRecordings;
          });
        }
        
        setRecordingTime(0);
        
        stream.getTracks().forEach(track => track.stop());
        
        // Save to localStorage immediately for persistence
        console.log('🎤 Saving recording to localStorage for persistence...');
        try {
          const backupRecordings = JSON.parse(localStorage.getItem('voice-recordings-backup') || '[]');
          backupRecordings.push({
            id: newRecording.id,
            milestone: newRecording.milestone,
            duration: newRecording.duration,
            timestamp: newRecording.timestamp.toISOString(),
            status: newRecording.status
          });
          localStorage.setItem('voice-recordings-backup', JSON.stringify(backupRecordings));
          console.log('🎤 Recording saved to localStorage backup');
        } catch (error) {
          console.error('🎤 Error saving to localStorage:', error);
        }
        
        toast({
          title: "Recording Saved",
          description: `Practice recording saved for Milestone ${currentMilestone}.`
        });
        
        // Don't auto-submit - let user decide when to submit
        console.log('🎤 Recording saved as draft - user can submit manually');
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

  const playRecording = (recording: MilestoneRecording) => {
    if (playingRecordingId === recording.id) {
      audioRef.current?.pause();
      setPlayingRecordingId(null);
      return;
    }

    const audio = new Audio(recording.url);
    audioRef.current = audio;
    
    audio.play();
    setPlayingRecordingId(recording.id);
    
    audio.onended = () => {
      setPlayingRecordingId(null);
    };
  };

  const deleteRecording = (id: string) => {
    setMilestoneRecordings(prev => prev.filter(rec => rec.id !== id));
    if (playingRecordingId === id) {
      audioRef.current?.pause();
      setPlayingRecordingId(null);
    }
    
    // Also remove from localStorage backup
    console.log('🎤 Removing recording from localStorage backup...');
    try {
      const backupRecordings = JSON.parse(localStorage.getItem('voice-recordings-backup') || '[]');
      const updatedBackup = backupRecordings.filter((rec: any) => rec.id !== id);
      localStorage.setItem('voice-recordings-backup', JSON.stringify(updatedBackup));
      console.log('🎤 Recording removed from localStorage backup');
    } catch (error) {
      console.error('🎤 Error removing from localStorage:', error);
    }
    
    toast({
      title: "Recording Deleted",
      description: "Practice recording removed successfully."
    });
  };

  const submitRecording = async (recording: MilestoneRecording) => {
    // Prevent duplicate submissions
    if (submittingRecordings.has(recording.id)) {
      console.log('🎤 Submission already in progress for recording:', recording.id);
      return;
    }

    // Check if already submitted
    if (recording.status === "submitted") {
      console.log('🎤 Recording already submitted:', recording.id);
      return;
    }

    try {
      // Mark as submitting
      setSubmittingRecordings(prev => new Set(prev).add(recording.id));
      
      console.log('🎤 Submitting voice recording:', recording);
      console.log('🎤 Recording blob size:', recording.blob.size);
      console.log('🎤 Recording duration:', recording.duration);
      console.log('🎤 Recording milestone:', recording.milestone);
      
      // Convert blob to base64
      const arrayBuffer = await recording.blob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('🎤 Base64 audio length:', base64Audio.length);
      console.log('🎤 Base64 audio preview:', base64Audio.substring(0, 50) + '...');
      
      const submissionData = {
        milestone: recording.milestone,
        audioBlob: base64Audio,
        duration: recording.duration,
        fileName: `milestone-${recording.milestone}-recording-${Date.now()}.wav`
      };

      console.log('🎤 Sending submission data:', {
        milestone: submissionData.milestone,
        duration: submissionData.duration,
        fileName: submissionData.fileName,
        audioBlobLength: submissionData.audioBlob.length
      });

      const token = localStorage.getItem('telugu-basics-token');
      console.log('🎤 Auth token available:', !!token);

      // Single submission attempt (no retry)
      const response = await fetch('https://backend-production-7e4df.up.railway.app/api/submissions/milestone-voice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      console.log('🎤 Submission response status:', response.status);
      console.log('🎤 Submission response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('🎤 Submission successful:', result);
        
        // Update local state
        setMilestoneRecordings(prev => 
          prev.map(rec => 
            rec.id === recording.id 
              ? { ...rec, status: "submitted" as const }
              : rec
          )
        );
        
        toast({
          title: "Recording Submitted",
          description: "Your practice recording has been submitted for evaluation."
        });
        
        // Remove from localStorage backup since it's now in backend
        console.log('🎤 Removing recording from localStorage backup...');
        try {
          const backupRecordings = JSON.parse(localStorage.getItem('voice-recordings-backup') || '[]');
          const updatedBackup = backupRecordings.filter((rec: any) => rec.id !== recording.id);
          localStorage.setItem('voice-recordings-backup', JSON.stringify(updatedBackup));
          console.log('🎤 Recording removed from localStorage backup');
        } catch (error) {
          console.error('🎤 Error removing from localStorage:', error);
        }
      } else {
        const errorText = await response.text();
        console.error('🎤 Submission failed:', errorText);
        console.error('🎤 Response status:', response.status);
        console.error('🎤 Response status text:', response.statusText);
        
        toast({
          title: "Submission Failed",
          description: `Failed to submit recording. Status: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🎤 Error submitting recording:', error);
      console.error('🎤 Error details:', error.message);
      
      toast({
        title: "Submission Error",
        description: `An error occurred while submitting your recording: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      // Remove from submitting state
      setSubmittingRecordings(prev => {
        const newSet = new Set(prev);
        newSet.delete(recording.id);
        return newSet;
      });
    }
  };


  const handleExamStart = async (exam: Exam) => {
    if (exam.isCompleted && exam.type === 'descriptive') {
      // For completed descriptive exams, show results view
      // Find the latest submission for this exam
      const examSubmissions = submissions.filter(sub => 
        sub.examId === exam.id || (sub.exam && sub.exam._id === exam.id)
      );
      
      // Get the latest submission (most recent)
      const submission = examSubmissions.length > 0 
        ? examSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
        : null;
      
      console.log('🔍 Looking for submission for exam:', exam.id);
      console.log('📋 All submissions:', submissions);
      console.log('🎯 Exam submissions found:', examSubmissions.length);
      console.log('📝 Selected submission:', submission);
      
      if (submission) {
        setSelectedSubmission(submission);
        setSelectedExam(exam);
        setShowResults(true);
        setShowExam(false);
      } else {
        // If no submission found, show a message
        toast({
          title: "No Submission Found",
          description: "No submission found for this exam. Please contact support.",
          variant: "destructive"
        });
      }
      return;
    }
    
    if (exam.isCompleted) {
      // For other completed exams, show results view
      setSelectedExam(exam);
      setShowExam(true);
      return;
    }

    // For descriptive exams, start the timer when student clicks start
    if (exam.type === 'descriptive') {
      try {
        const response = await fetch(`https://backend-production-7e4df.up.railway.app/api/exam-attempts/start/${exam.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('telugu-basics-token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Exam attempt started:', result);
          
          // Store attempt info for the exam interface
          exam.attemptId = result.data.attemptId;
          exam.attemptStartedAt = result.data.startedAt;
          exam.attemptTimeLimit = result.data.timeLimit;
          exam.attemptRemainingTime = result.data.remainingTime;
          
          console.log('📝 Updated exam with attempt data:', {
            attemptId: exam.attemptId,
            attemptStartedAt: exam.attemptStartedAt,
            attemptTimeLimit: exam.attemptTimeLimit,
            attemptRemainingTime: exam.attemptRemainingTime
          });
          
          setSelectedExam(exam);
          setShowExam(true);
        } else {
          const errorText = await response.text();
          console.error('Failed to start exam attempt:', errorText);
          toast({
            title: "Error Starting Exam",
            description: "Failed to start exam. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error starting exam attempt:', error);
        toast({
          title: "Error Starting Exam",
          description: "Failed to start exam. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // For non-descriptive exams, just show the exam
      setSelectedExam(exam);
      setShowExam(true);
    }
  };

  const handleExamComplete = async (results: ExamResults) => {
    console.log('LearnerDashboard - Exam completed with results:', results);
    setShowExam(false);
    
    if (selectedExam) {
      try {
        // Create submission record with only valid fields
        const submissionData = {
          examId: selectedExam.id,
          submissionType: selectedExam.type,
          score: results.score,
          totalQuestions: results.totalQuestions,
          correctAnswers: results.score, // This should be the count of correct answers
          timeSpent: results.timeSpent,
          answers: results.answers // Send the actual answers
        };
        
        console.log('LearnerDashboard - Submitting exam data:', submissionData);
        
        const submissionResponse = await fetch('https://backend-production-7e4df.up.railway.app/api/submissions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('telugu-basics-token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData)
        });

        console.log('LearnerDashboard - Submission response status:', submissionResponse.status);

        if (submissionResponse.ok) {
          const submissionResult = await submissionResponse.json();
          console.log('LearnerDashboard - Submission result:', submissionResult);
          
          // Update the exam score in the local state immediately
          setExams(prevExams => 
            prevExams.map(exam => 
              exam.id === selectedExam.id 
                ? { 
                    ...exam, 
                    isCompleted: true, 
                    score: results.percentage,
                    cannotRetake: true // Mark as cannot retake
                  }
                : exam
            )
          );
          
          toast({
            title: "Exam Completed! 🎉",
            description: `Congratulations! You scored ${results.percentage}% on ${selectedExam.title}. Your submission has been recorded and cannot be retaken.`,
            variant: results.percentage >= 70 ? "default" : "destructive"
          });
        } else {
          const errorText = await submissionResponse.text();
          console.error('LearnerDashboard - Submission error response:', errorText);
          
          toast({
            title: "Submission Error",
            description: "Exam completed but failed to save submission. Please contact support.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to submit exam:', error);
        toast({
          title: "Submission Error",
          description: "Exam completed but failed to save submission. Please contact support.",
          variant: "destructive"
        });
      }
    }
    
    setSelectedExam(null);
    
    // Update the exam completion status immediately without relying on fetchSubmissions
    setExams(prevExams => 
      prevExams.map(exam => 
        exam.id === selectedExam.id 
          ? { 
              ...exam, 
              isCompleted: true, 
              score: results.percentage,
              cannotRetake: true // Mark as cannot retake
            }
          : exam
      )
    );
    
    // Only refresh exams, skip submissions since it's failing
    setTimeout(() => {
      fetchExams();
    }, 1000);
  };

  const handleDescriptiveExamComplete = async (submissions: any[]) => {
    console.log('LearnerDashboard - Descriptive exam completed with submissions:', submissions);
    
    // Immediately close the exam interface
    setShowExam(false);
    setSelectedExam(null);
    
    if (selectedExam) {
      try {
        // Create submission record for descriptive exam
        const submissionData = {
          examId: selectedExam.id,
          submissionType: 'descriptive',
          descriptiveAnswers: submissions.map(submission => ({
            questionIndex: submission.questionIndex,
            question: submission.question,
            textAnswer: submission.textAnswer || '',
            pdfUrl: submission.pdfUrl,
            fileName: submission.fileName,
            fileSize: submission.fileSize,
            submittedAt: submission.submittedAt
          })),
          timeSpent: 0, // Descriptive exams don't have time limits
          status: 'pending' // Will be evaluated by evaluator
        };
        
        console.log('LearnerDashboard - Submitting descriptive exam data:', submissionData);
        
        const submissionResponse = await fetch('https://backend-production-7e4df.up.railway.app/api/submissions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('telugu-basics-token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData)
        });

        console.log('LearnerDashboard - Descriptive submission response status:', submissionResponse.status);

        if (submissionResponse.ok) {
          const submissionResult = await submissionResponse.json();
          console.log('LearnerDashboard - Descriptive submission result:', submissionResult);
          
          // Update the exam completion status in the local state immediately
          setExams(prevExams => 
            prevExams.map(exam => 
              exam.id === selectedExam.id 
                ? { 
                    ...exam, 
                    isCompleted: true, 
                    score: undefined, // No score yet - pending evaluation
                    cannotRetake: true // Mark as cannot retake
                  }
                : exam
            )
          );
          
          toast({
            title: "Descriptive Exam Submitted! 📝",
            description: "Your PDF submissions have been sent for evaluation. You will receive your score once an evaluator reviews your work.",
          });
          
          console.log('LearnerDashboard - Exam interface should be closed now');
        } else {
          const errorText = await submissionResponse.text();
          console.error('LearnerDashboard - Descriptive submission error response:', errorText);
          
          toast({
            title: "Submission Error",
            description: "Failed to submit descriptive exam. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to submit descriptive exam:', error);
        toast({
          title: "Submission Error",
          description: "Failed to submit descriptive exam. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    // Ensure exam interface is closed even if there's an error
    setShowExam(false);
    setSelectedExam(null);
    
    // Refresh exams to get updated status
    setTimeout(() => {
      fetchExams();
    }, 1000);
  };

  const handleStartLearning = () => {
    setActiveTab("curriculum");
    setShowVideoContent(true);
    setCurrentMilestone(1);
    
    console.log('🎬 Video lectures from database:', videoLectures);
    
    // Find video lecture for milestone 1 from backend data
    const videoLecture = videoLectures.find(video => video.milestone === 1);
    console.log('🎬 Found video lecture for milestone 1:', videoLecture);
    
    if (videoLecture) {
      console.log('🎬 Setting video URL:', videoLecture.videoUrl);
      setCurrentVideo(getVideoUrl(videoLecture.videoUrl));
      toast({
        title: "Starting Structured Learning",
        description: `Loading ${videoLecture.isYouTubeVideo ? 'YouTube' : 'video'} for Telugu vowels tutorial`
      });
    } else {
      console.log('⚠️ No video lecture found for milestone 1, using fallback');
      // Fallback to default YouTube video
      setCurrentVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      toast({
        title: "Starting Structured Learning",
        description: "Loading Telugu vowels tutorial video (no custom video found)"
      });
    }
  };

  const handleMilestoneSelect = (milestoneId: number) => {
    setCurrentMilestone(milestoneId);
    
    // Find video lecture for this milestone from backend data
    const videoLecture = videoLectures.find(video => video.milestone === milestoneId);
    
    if (videoLecture) {
      setCurrentVideo(getVideoUrl(videoLecture.videoUrl));
      toast({
        title: "Milestone Selected",
        description: `Loading ${videoLecture.isYouTubeVideo ? 'YouTube' : 'video'} for Milestone ${milestoneId}`
      });
    } else {
      // Fallback to default YouTube video
      setCurrentVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      toast({
        title: "Milestone Selected",
        description: `Loading video for Milestone ${milestoneId} (no custom video found)`
      });
    }
  };

  const getMilestoneTitle = (milestoneId: number) => {
    const titles = {
      1: "Telugu Basics - Lesson 1: Vowels (ఆ నుంచి అహ వరకు)",
      2: "Telugu Basics - Lesson 2: Consonants (క నుంచి బండి ర వరకు)",
      3: "Telugu Basics - Lesson 3: Special Characters (తలకట్టు to విసర్గమ్)",
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
    return titles[milestoneId as keyof typeof titles] || `Lesson ${milestoneId}`;
  };

  const getMilestoneDescription = (milestoneId: number) => {
    const descriptions = {
      1: "Learn Telugu vowels from ఆ to అహ with forward and backward recitation",
      2: "Master basic consonants from క to బండి ర with forward and backward recitation",
      3: "Learn special characters, modifiers, and their usage in Telugu script",
      4: "Learn the first method of guninthalu with 5 examples forward and backward",
      5: "Master the second method of guninthalu with 5 examples forward and backward",
      6: "Learn the third method of guninthalu with 5 examples forward and backward",
      7: "Practice three consonant combinations in guninthalu formation",
      8: "Master two consonant combinations in guninthalu formation",
      9: "Learn 50 simple Telugu words with proper pronunciation and meaning",
      10: "Master the foundational four-step methodology for word formation",
      11: "Learn advanced four-step methodology for complex word formation",
      12: "Practice 10 double letter words using the four-step method",
      13: "Learn 10 compound letter words using the four-step method",
      14: "Master 10 words with two double letters using advanced techniques",
      15: "Practice 10 words with two compound letters using advanced techniques",
      16: "Learn 10 complex combination words with multiple letter modifications",
      17: "హాల్లు ను పూర్తిగా మార్చడం ద్వారా ఒత్తు వచ్చే వాటిని చెప్పగలరా? - Can you tell me about those that get 'otthu' by completely changing the consonant?",
      18: "హాల్లు కు వున్న తలకట్టు తీసివేయడం ద్వారా ఒత్తు వచ్చే వాటిని చెప్పగలరా? - Can you tell me about those that get 'otthu' by removing the 'talakattu' from the consonant?",
      19: "హల్లులో ఎలాంటి మార్పు అవసరంలేకుండా ఒత్తు వచ్చే వాటిని చెప్పగలరా?"
    };
    return descriptions[milestoneId as keyof typeof descriptions] || `Lesson ${milestoneId} description`;
  };

  const handleVideoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalProgress = activities.length > 0 ? activities.reduce((sum, activity) => sum + activity.progress, 0) / activities.length : 0;
  const completedActivities = activities.filter(a => a.isCompleted).length;
  const completedExams = exams.filter(e => e.isCompleted).length;

  const currentMilestoneRecordings = milestoneRecordings.filter(r => r.milestone === currentMilestone);
  const canRecord = currentMilestoneRecordings.length < 5;
  
  // Debug logging for voice recordings
  console.log('🎤 Voice recordings debug:', {
    totalRecordings: milestoneRecordings.length,
    currentMilestone,
    currentMilestoneRecordings: currentMilestoneRecordings.length,
    recordings: currentMilestoneRecordings.map(r => ({
      id: r.id,
      status: r.status,
      duration: r.duration,
      timestamp: r.timestamp
    }))
  });

  // Check if user has learner role
  if (!user || user.role !== 'learner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the Learner Dashboard.</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (showResults && selectedExam && selectedSubmission) {
    return (
      <div className="min-h-screen bg-gradient-primary p-4">
        <DescriptiveResultsView
          submission={selectedSubmission}
          questions={selectedExam.descriptiveQuestions || []}
          onClose={() => {
            setShowResults(false);
            setSelectedExam(null);
            setSelectedSubmission(null);
          }}
          examMaxMarks={selectedExam.totalMaxMarks || 100}
        />
      </div>
    );
  }

  if (showExam && selectedExam) {
    return (
      <div className="min-h-screen bg-gradient-primary p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setShowExam(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          {selectedExam.type === "descriptive" ? (
            <>
              {console.log('LearnerDashboard - selectedExam for descriptive:', selectedExam)}
              {console.log('LearnerDashboard - descriptiveQuestions:', selectedExam.descriptiveQuestions)}
              <DescriptiveExamInterface
                exam={{
                  id: selectedExam.id,
                  title: selectedExam.title,
                  description: selectedExam.description,
                  openDate: selectedExam.openDate || new Date().toISOString(),
                  descriptiveTimeLimit: selectedExam.descriptiveTimeLimit || 60,
                  // Include attempt properties
                  attemptId: selectedExam.attemptId,
                  attemptStartedAt: selectedExam.attemptStartedAt,
                  attemptTimeLimit: selectedExam.attemptTimeLimit,
                  attemptRemainingTime: selectedExam.attemptRemainingTime,
                  descriptiveQuestions: selectedExam.descriptiveQuestions || []
                }}
                onComplete={handleDescriptiveExamComplete}
                onClose={() => setShowExam(false)}
              />
            </>
          ) : (
            <ExamInterface
              examType={selectedExam.type}
              title={selectedExam.title}
              description={selectedExam.description}
              timeLimit={selectedExam.timeLimit}
              mcqQuestions={selectedExam.mcqQuestions}
              voiceQuestions={selectedExam.voiceQuestions}
              onComplete={handleExamComplete}
              isViewingResults={selectedExam.isCompleted}
              previousResults={selectedExam.isCompleted ? {
                score: selectedExam.score || 0,
                                              totalQuestions: (selectedExam.mcqQuestions?.length || 0) + (selectedExam.descriptiveQuestions?.length || 0) + (selectedExam.voiceQuestions?.length || 0),
                percentage: selectedExam.score || 0,
                answers: submissionDetails[selectedExam.id]?.answers || {},
                voiceRecordings: {},
                timeSpent: submissionDetails[selectedExam.id]?.timeSpent || 0
              } : undefined}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    Welcome {user?.name || 'username'}!
                  </h1>
                  <p className="text-lg text-white/80">Continue your Telugu learning journey with passion</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Welcome, {user?.name || 'Learner'}!</span>
                <Badge variant="secondary">{user?.role || 'Unknown Role'}</Badge>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  fetchSubmissions();
                  fetchExams();
                  toast({
                    title: "Data Refreshed",
                    description: "Your evaluation results have been updated.",
                  });
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Overall Progress</p>
                  <p className="text-3xl font-bold text-primary">{Math.round(totalProgress)}%</p>
                  <Progress value={totalProgress} className="mt-3 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/30 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Activities Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedActivities}/{activities.length}</p>
                  <div className="mt-3 h-2 bg-green-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${activities.length > 0 ? (completedActivities / activities.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/30 rounded-xl">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Exams Passed</p>
                  <p className="text-3xl font-bold text-blue-600">{completedExams}/{exams.length}</p>
                  <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${exams.length > 0 ? (completedExams / exams.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-primary/10 border border-primary/20">
                <TabsTrigger value="activities" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Play className="w-4 h-4" />
                  Learning Activities
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="w-4 h-4" />
                  Exams & Assessments
                </TabsTrigger>
                <TabsTrigger value="curriculum" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BookOpen className="w-4 h-4" />
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="voice-recording" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Mic className="w-4 h-4" />
                  Voice Recording
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activities" className="space-y-4">
                <div className="grid gap-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Play className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">No Learning Activities Yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Your learning activities will appear here once they are assigned. Start your journey with structured lessons!
                      </p>
                      <Button onClick={handleStartLearning} className="px-8 py-3">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Start Learning
                      </Button>
                    </div>
                  ) : (
                    <>
                      {activities.map((activity, index) => (
                        <Card key={activity.id || generateUniqueKey('activity', undefined, index)} className="hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl">
                                  {activity.type === "video" && <Play className="w-5 h-5 text-primary" />}
                                  {activity.type === "practice" && <Mic className="w-5 h-5 text-primary" />}
                                  {activity.type === "assessment" && <FileText className="w-5 h-5 text-primary" />}
                                </div>
                                
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-lg">{activity.title}</h3>
                                  <p className="text-sm text-primary font-medium">{activity.teluguTitle}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatTime(activity.duration)}
                                    </span>
                                    <Badge variant={activity.isCompleted ? "default" : "secondary"} className="px-3 py-1">
                                      {activity.isCompleted ? "Completed" : "In Progress"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                                {activity.isCompleted ? "Review" : "Continue"}
                              </Button>
                            </div>
                            
                            {!activity.isCompleted && (
                              <div className="mt-4">
                                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                  <span>Progress</span>
                                  <span>{Math.round(activity.progress)}%</span>
                                </div>
                                <Progress value={activity.progress} className="h-2" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="exams" className="space-y-4">
                {/* Exam Statistics Summary */}
                {exams.length > 0 && (
                  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-primary">Exam Progress</h3>
                        <Button 
                          onClick={() => {
                            fetchExams();
                            fetchSubmissions();
                          }}
                          variant="outline" 
                          size="sm"
                          className="border-primary/30 hover:bg-primary/10"
                        >
                          🔄 Refresh Status
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {exams.filter(exam => 
                              selectedMilestone === "all" || exam.milestone?.toString() === selectedMilestone
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Exams</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {exams.filter(exam => 
                              (selectedMilestone === "all" || exam.milestone?.toString() === selectedMilestone) && exam.isCompleted
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Completed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {exams.filter(exam => 
                              (selectedMilestone === "all" || exam.milestone?.toString() === selectedMilestone) && !exam.isCompleted
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Available</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {exams.filter(exam => 
                              (selectedMilestone === "all" || exam.milestone?.toString() === selectedMilestone) && 
                              exam.createdAt && (new Date().getTime() - new Date(exam.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000)
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">New This Week</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Milestone Filter */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-primary">Filter by Milestone:</span>
                        <Select value={selectedMilestone} onValueChange={setSelectedMilestone}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select milestone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Milestones</SelectItem>
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((milestone) => (
                              <SelectItem key={milestone} value={milestone.toString()}>
                                Milestone {milestone}: {getMilestoneTitle(milestone)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exams.filter(exam => 
                          selectedMilestone === "all" || exam.milestone?.toString() === selectedMilestone
                        ).length} exams
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid gap-4">
                  {exams.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        No Exams Available
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Exams will appear here when they are posted by your trainers. Keep checking back for new assessments!
                      </p>
                    </div>
                  ) : (
                    <>
                      {exams
                        .filter(exam => 
                          selectedMilestone === "all" || exam.milestone?.toString() === selectedMilestone
                        )
                        .map((exam, index) => (
                        <Card key={exam.id || generateUniqueKey('exam', undefined, index)} className={`hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 ${
                          exam.isCompleted ? 'ring-2 ring-green-200' : ''
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              {exam.isCompleted && (
                                <div className="absolute top-4 right-4">
                                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              )}
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{exam.title}</h3>
                                  <div className="flex items-center gap-2">
                                    {exam.isCompleted ? (
                                      <>
                                        <Badge variant="default" className={`px-3 py-1 ${
                                          exam.type === 'descriptive' ? 'bg-blue-600' : 'bg-green-600'
                                        }`}>
                                          {exam.type === 'descriptive' ? 'Submitted' : 'Completed'}
                                        </Badge>
                                        {exam.type === 'descriptive' ? (
                                          <div className="flex items-center gap-1 text-blue-600 font-semibold">
                                            <FileText className="w-4 h-4" />
                                            Pending
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                                            <Star className="w-4 h-4" />
                                            {exam.score}%
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <Badge variant="secondary" className="px-3 py-1">
                                        Available
                                      </Badge>
                                    )}
                                    {/* Show "New" badge for exams posted within last 7 days */}
                                    {exam.createdAt && (new Date().getTime() - new Date(exam.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000) && (
                                      <Badge variant="default" className="px-3 py-1 bg-blue-600 animate-pulse">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{exam.description}</p>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {exam.timeLimit} minutes
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    {exam.type.toUpperCase()}
                                  </span>
                                  {exam.milestone && (
                                    <span className="flex items-center gap-1">
                                      <Target className="w-4 h-4" />
                                      Milestone {exam.milestone}
                                    </span>
                                  )}
                                  {exam.difficulty && (
                                    <span className="flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" />
                                      {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                                    </span>
                                  )}
                                  {exam.passingScore && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4" />
                                      Pass: {exam.passingScore}%
                                    </span>
                                  )}
                                  {exam.score && (
                                    <span className="flex items-center gap-1">
                                      <Star className="w-4 h-4" />
                                      Score: {exam.score}%
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Posted: {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Recently'}
                                  </span>
                                  {exam.createdBy && (
                                    <span className="flex items-center gap-1">
                                      <GraduationCap className="w-4 h-4" />
                                      By: {exam.createdBy.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {exam.isCompleted ? (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-primary mb-1">
                                    {exam.type === 'descriptive' ? 
                                      (exam.score ? `${exam.score}/${exam.totalMaxMarks || 100}` : '📝') : 
                                      `${exam.score}%`
                                    }
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    {exam.type === 'descriptive' ? 
                                      (exam.score ? 'Marks Awarded' : 'Submitted for Evaluation') : 
                                      'Final Score'
                                    }
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    {exam.type === 'descriptive' ? 
                                      (exam.score ? '✅ EVALUATED' : '📝 PENDING EVALUATION') : 
                                      (exam.score >= (exam.passingScore || 70) ? '✅ PASSED' : '❌ FAILED')
                                    }
                                  </div>
                                  <div className="text-xs text-red-500 mb-2">
                                    Cannot Retake
                                  </div>
                                  <Button 
                                    onClick={() => handleExamStart(exam)}
                                    size="sm"
                                    variant="outline"
                                    className="border-primary/30 hover:bg-primary/10"
                                  >
                                    {exam.type === 'descriptive' ? 'View Submission' : 'View Results'}
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  onClick={() => handleExamStart(exam)}
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-white"
                                >
                                  Attempt Test
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="curriculum">
                {showVideoContent ? (
                  <div className="space-y-6">
                    {/* Video Player Section */}
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="w-5 h-5" />
                          {getMilestoneTitle(currentMilestone)}
                        </CardTitle>
                        <CardDescription>
                          {getMilestoneDescription(currentMilestone)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentVideo ? (
                          <div className="space-y-4">
                            {isYouTubeUrl(currentVideo) ? (
                              <YouTubePlayer
                                videoUrl={currentVideo}
                                title={getMilestoneTitle(currentMilestone)}
                                description={getMilestoneDescription(currentMilestone)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                showControls={true}
                                autoplay={false}
                                muted={false}
                                loop={false}
                              />
                            ) : (
                              <>
                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                  <video 
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay={false}
                                    preload="metadata"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onLoadStart={() => console.log("Video loading started")}
                                    onCanPlay={() => console.log("Video can play")}
                                    onError={(e) => {
                                      console.log("Video error:", e);
                                      // Fallback to a placeholder video
                                      setCurrentVideo("");
                                    }}
                                  >
                                    <source src={currentVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={handleVideoPlay}
                                    className="flex items-center gap-2"
                                  >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {isPlaying ? "Pause" : "Play"} Video
                                  </Button>
                                  <Button variant="outline" className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4" />
                                    Audio Only
                                  </Button>
                                  <Button variant="outline" className="flex items-center gap-2">
                                    <Maximize className="w-4 h-4" />
                                    Fullscreen
                                  </Button>
                                </div>
                              </>
                            )}
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-semibold mb-2">Lesson Summary:</h4>
                              <p className="text-sm text-muted-foreground">
                                This lesson covers all Telugu vowels including అ, ఆ, ఇ, ఈ, ఉ, ఊ, ఋ, ౠ, ఎ, ఏ, ఐ, ఒ, ఓ, ఔ, అం, and అః. 
                                Practice forward and backward recitation to master pronunciation.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Fallback Video Player */}
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/30">
                              <div className="text-center">
                                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Play className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{getMilestoneTitle(currentMilestone)}</h3>
                                <p className="text-muted-foreground mb-4">
                                  {getMilestoneDescription(currentMilestone)}
                                </p>
                                <div className="flex gap-2 justify-center">
                                  <Button 
                                    onClick={() => {
                                      // Try to load a sample YouTube video for demonstration
                                      const sampleYouTubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                                      setCurrentVideo(sampleYouTubeUrl);
                                      toast({
                                        title: "YouTube Video Loading",
                                        description: `Loading sample YouTube video for Milestone ${currentMilestone}`
                                      });
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Play className="w-4 h-4" />
                                    Load Sample YouTube Video
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      setCurrentVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                                      toast({
                                        title: "Video Loading",
                                        description: `Loading YouTube video for Milestone ${currentMilestone}`
                                      });
                                    }}
                                    className="flex items-center gap-2"
                                    variant="outline"
                                  >
                                    <Play className="w-4 h-4" />
                                    Load Direct Video
                                  </Button>
                                  <Button variant="outline" className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    View Transcript
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-semibold mb-2">Lesson Summary:</h4>
                              <p className="text-sm text-muted-foreground">
                                {getMilestoneDescription(currentMilestone)}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Practice Section - Audio Recording for Milestones 1-8 */}
                      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Mic className="w-5 h-5" />
                            Practice Recording
                          </CardTitle>
                          <CardDescription>
                            Record your pronunciation practice for Milestone {currentMilestone}. You can save up to 5 recordings per milestone.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        {/* Loading Status */}
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-2">
                            📊 Total Recordings: {milestoneRecordings.length} | 
                            Current Milestone: {currentMilestoneRecordings.length}
                          </div>
                        </div>
                        
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
                              {isRecording ? "Stop Recording" : "🎤 Practice"}
                            </Button>
                          </div>

                          {isRecording && (
                            <div className="flex items-center justify-center gap-2 text-destructive">
                              <Timer className="w-4 h-4" />
                              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground">
                            {currentMilestoneRecordings.length} of 5 recordings saved for Milestone {currentMilestone}
                          </div>

                          <Progress value={(currentMilestoneRecordings.length / 5) * 100} className="w-32 mx-auto" />
                          
                          {/* Force Submit All Recordings Button */}
                          {currentMilestoneRecordings.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('🎤 Force submitting all recordings for milestone:', currentMilestone);
                                currentMilestoneRecordings.forEach(recording => {
                                  if (recording.status === "draft") {
                                    submitRecording(recording);
                                  }
                                });
                                toast({
                                  title: "Force Submit",
                                  description: `Attempting to submit ${currentMilestoneRecordings.filter(r => r.status === "draft").length} draft recordings`
                                });
                              }}
                            >
                              🔄 Force Submit All Draft Recordings
                            </Button>
                          )}

                          {/* Clear All Recordings Button (for debugging) */}
                          {currentMilestoneRecordings.length > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                clearAllRecordings();
                                toast({
                                  title: "Cleared All Recordings",
                                  description: "All recordings have been cleared"
                                });
                              }}
                            >
                              🗑️ Clear All Recordings
                            </Button>
                          )}

                          {/* Cleanup Invalid Recordings Button */}
                          {currentMilestoneRecordings.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                cleanupInvalidRecordings();
                              }}
                            >
                              🧹 Cleanup Invalid Recordings
                            </Button>
                          )}
                        </div>

                        {/* Recordings List */}
                        {currentMilestoneRecordings.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="font-medium">Your Practice Recordings ({currentMilestoneRecordings.length})</h4>
                            <div className="space-y-2">
                              {currentMilestoneRecordings.map((recording, index) => {
                                console.log('🎤 Rendering recording:', {
                                  id: recording.id,
                                  status: recording.status,
                                  duration: recording.duration,
                                  milestone: recording.milestone
                                });
                                
                                return (
                                  <div 
                                    key={recording.id} 
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Badge variant="secondary">#{index + 1}</Badge>
                                      <div className="text-sm">
                                        <div className="font-medium">Practice Recording {index + 1}</div>
                                        <div className="text-muted-foreground">
                                          {formatTime(recording.duration)} • {recording.timestamp.toLocaleTimeString()}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                          Status: {recording.status} | Duration: {recording.duration}s
                                        </div>
                                      </div>
                                      {recording.status === "submitted" && (
                                        <Badge variant="default" className="text-xs">Submitted</Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => playRecording(recording)}
                                      >
                                        {playingRecordingId === recording.id ? (
                                          <Pause className="w-4 h-4" />
                                        ) : (
                                          <Play className="w-4 h-4" />
                                        )}
                                      </Button>
                                      
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                          console.log('🎤 Submit button clicked for recording:', recording.id);
                                          submitRecording(recording);
                                        }}
                                        disabled={recording.status === "submitted" || submittingRecordings.has(recording.id)}
                                      >
                                        {recording.status === "submitted" 
                                          ? "✅ Submitted" 
                                          : submittingRecordings.has(recording.id)
                                            ? "📤 Submitting..."
                                            : "📩 Submit"
                                        }
                                      </Button>
                                      
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteRecording(recording.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No recordings yet. Start practicing to see your recordings here!</p>
                          </div>
                        )}
                        </CardContent>
                      </Card>

                    {/* Milestone System */}
                    <MilestoneSystem 
                      currentMilestone={currentMilestone}
                      onMilestoneSelect={handleMilestoneSelect}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Ready to Start Learning?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Begin your Telugu learning journey with structured video lessons and interactive content.
                    </p>
                    <Button onClick={handleStartLearning} className="px-8 py-3">
                      <Play className="w-5 h-5 mr-2" />
                      Start Structured Learning
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="voice-recording" className="space-y-4">
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Milestone Voice Recording
                    </CardTitle>
                    <CardDescription>
                      Record your voice for specific milestones and submit for evaluation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Milestone Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label htmlFor="voice-milestone">Select Milestone:</Label>
                        <Select 
                          value={currentMilestone.toString()} 
                          onValueChange={(value) => setCurrentMilestone(parseInt(value))}
                        >
                          <SelectTrigger className="w-60">
                            <SelectValue placeholder="Select milestone" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((milestone) => (
                              <SelectItem key={milestone} value={milestone.toString()}>
                                Milestone {milestone}: {getMilestoneTitle(milestone)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          {getMilestoneTitle(currentMilestone)}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {getMilestoneDescription(currentMilestone)}
                        </p>
                      </div>
                    </div>

                    {/* Recording Interface */}
                    <div className="space-y-4">
                      <div className="text-center space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Voice recording feature is currently disabled
                        </div>
                      </div>

                      {/* Current Recording */}
                      {currentMilestoneRecordings.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Current Recording for Milestone {currentMilestone}</h4>
                          <div className="space-y-2">
                            {currentMilestoneRecordings.map((recording, index) => (
                              <div 
                                key={recording.id} 
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary">#{index + 1}</Badge>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {recording.isWordPuzzle ? "Word Puzzle" : "Voice Recording"}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {recording.isWordPuzzle 
                                        ? `Score: ${recording.wordPuzzleData?.score || 0}% • ${recording.timestamp.toLocaleTimeString()}`
                                        : `${formatTime(recording.duration)} • ${recording.timestamp.toLocaleTimeString()}`
                                      }
                                    </div>
                                    <div className="text-xs text-blue-600">
                                      Status: {recording.status}
                                      {recording.isWordPuzzle && recording.wordPuzzleData?.passed && " • Auto-Evaluated"}
                                    </div>
                                  </div>
                                  {recording.status === "submitted" && (
                                    <Badge variant="default" className="text-xs">
                                      {recording.isWordPuzzle && recording.wordPuzzleData?.passed ? "Perfect Score" : "Submitted"}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => playRecording(recording)}
                                  >
                                    {playingRecordingId === recording.id ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </Button>
                                  
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => submitRecording(recording)}
                                    disabled={recording.status === "submitted"}
                                  >
                                    {recording.status === "submitted" ? "✅ Submitted" : "📩 Submit for Evaluation"}
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteRecording(recording.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Previous Submissions */}
                      {(() => {
                        const voiceSubmissions = submissions.filter(sub => sub.submissionType === "voice" && sub.milestone === currentMilestone);
                        console.log('🎤 Debug - All submissions:', submissions);
                        console.log('🎤 Debug - Current milestone:', currentMilestone);
                        console.log('🎤 Debug - Voice submissions for milestone:', voiceSubmissions);
                        console.log('🎤 Debug - Submission types:', submissions.map(s => ({ id: s.id, type: s.submissionType, milestone: s.milestone, status: s.status })));
                        return voiceSubmissions.length > 0;
                      })() && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Previous Submissions for Milestone {currentMilestone}</h4>
                          <div className="space-y-2">
                            {submissions
                              .filter(sub => sub.submissionType === "voice" && sub.milestone === currentMilestone)
                              .map((submission, index) => (
                                <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium">Submission #{index + 1}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                        {submission.recordingDuration && ` • Duration: ${submission.recordingDuration}s`}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {submission.status === "evaluated" && submission.score !== undefined ? (
                                        <Badge variant="default" className="text-green-600 bg-green-100">
                                          Score: {submission.score}/100
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {submission.feedback && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <h6 className="font-medium text-blue-900 mb-1">Evaluator Feedback:</h6>
                                      <p className="text-sm text-blue-700">{submission.feedback}</p>
                                    </div>
                                  )}
                                  
                                  {submission.tags && submission.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {submission.tags.map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Debug: Show all voice submissions if none found for current milestone */}
                      {submissions.filter(sub => sub.submissionType === "voice").length > 0 && 
                       submissions.filter(sub => sub.submissionType === "voice" && sub.milestone === currentMilestone).length === 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-orange-600">All Voice Submissions (Debug)</h4>
                          <div className="space-y-2">
                            {submissions
                              .filter(sub => sub.submissionType === "voice")
                              .map((submission, index) => (
                                <div key={submission.id} className="border border-orange-200 rounded-lg p-4 space-y-3 bg-orange-50">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium">Submission #{index + 1} (Milestone {submission.milestone})</h5>
                                      <p className="text-sm text-muted-foreground">
                                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                        {submission.recordingDuration && ` • Duration: ${submission.recordingDuration}s`}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {submission.status === "evaluated" && submission.score !== undefined ? (
                                        <Badge variant="default" className="text-green-600 bg-green-100">
                                          Score: {submission.score}/100
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {submission.feedback && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <h6 className="font-medium text-blue-900 mb-1">Evaluator Feedback:</h6>
                                      <p className="text-sm text-blue-700">{submission.feedback}</p>
                                    </div>
                                  )}
                                  
                                  {submission.tags && submission.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {submission.tags.map((tag, tagIndex) => (
                                        <Badge key={tagIndex} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearnerDashboard; 