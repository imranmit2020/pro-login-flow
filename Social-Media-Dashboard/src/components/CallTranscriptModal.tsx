"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  User, 
  MessageSquare, 
  FileText,
  X,
  Download,
  Copy
} from "lucide-react";
import { TranscriptResponse, AudioResponse } from "@/types/elevenlabs";

interface CallTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

export function CallTranscriptModal({ isOpen, onClose, conversationId }: CallTranscriptModalProps) {
  const [transcript, setTranscript] = useState<TranscriptResponse['data'] | null>(null);
  const [audioData, setAudioData] = useState<AudioResponse['data'] | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const fetchTranscript = async () => {
    setTranscriptLoading(true);
    try {
      const response = await fetch(`/api/elevenlabs/getTranscript?conversationId=${conversationId}`);
      const data: TranscriptResponse = await response.json();
      if (data.success && data.data) {
        setTranscript(data.data);
      } else {
        console.error("Error fetching transcript:", data.error);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
    } finally {
      setTranscriptLoading(false);
    }
  };

  const fetchAudio = async () => {
    setAudioLoading(true);
    setAudioError(null);
    try {
      const response = await fetch(`/api/elevenlabs/getRecordingAudio?conversationId=${conversationId}`);
      const data: AudioResponse = await response.json();
      if (data.success && data.data) {
        setAudioData(data.data);
      } else {
        setAudioError(data.error || "Failed to load audio");
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
      setAudioError("Failed to load audio");
    } finally {
      setAudioLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && conversationId) {
      Promise.all([fetchTranscript(), fetchAudio()]);
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    if (audioData && !audioElement) {
      const audio = new Audio(`data:${audioData.content_type};base64,${audioData.audio_base64}`);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, [audioData]);

  const toggleAudio = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleString();
  };

  const copyTranscript = async () => {
    if (transcript?.transcript) {
      try {
        await navigator.clipboard.writeText(transcript.transcript);
        // You could add a toast notification here
      } catch (error) {
        console.error("Failed to copy transcript:", error);
      }
    }
  };

  const downloadTranscript = () => {
    if (transcript?.transcript) {
      const blob = new Blob([transcript.transcript], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${conversationId}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Call Transcript
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyTranscript}
                disabled={!transcript?.transcript}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTranscript}
                disabled={!transcript?.transcript}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recording Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Agent</p>
                    <p className="font-medium">{transcript?.agent_name || "Loading..."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {transcript ? formatDuration(transcript.duration || 0) : "Loading..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={transcript?.status === 'completed' ? 'default' : 'secondary'}>
                      {transcript?.status || "Loading..."}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-mono text-xs">{conversationId}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Player */}
          {audioData && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleAudio}
                    disabled={audioLoading}
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Play
                      </>
                    )}
                  </Button>
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Call Recording</span>
                </div>
              </CardContent>
            </Card>
          )}

          {audioError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600 text-sm">{audioError}</p>
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Transcript
              </h3>
              
              {transcriptLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading transcript...</span>
                </div>
              ) : transcript?.transcript ? (
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {transcript.transcript}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No transcript available for this recording.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {transcript?.summary && 
           transcript.summary !== "Summary not available" && 
           transcript.summary !== "Summary not available for this recording." && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Summary
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm">{transcript.summary}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
