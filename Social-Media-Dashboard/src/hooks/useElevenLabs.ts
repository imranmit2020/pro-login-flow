import { useState, useEffect } from 'react';
import { RecordingData, TranscriptResponse, AudioResponse, ElevenLabsUsageData, ActiveCallsData } from '@/types/elevenlabs';

export function useElevenLabs() {
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [usage, setUsage] = useState<ElevenLabsUsageData['data'] | null>(null);
  const [activeCalls, setActiveCalls] = useState<ActiveCallsData['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = async (date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/elevenlabs/getRecordings?date=${targetDate}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecordings(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching recordings:', err);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/elevenlabs/usage');
      if (response.ok) {
        const data: ElevenLabsUsageData = await response.json();
        if (data.success) {
          setUsage(data.data || null);
        }
      }
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  };

  const fetchActiveCalls = async () => {
    try {
      const response = await fetch('/api/elevenlabs/getActiveCalls');
      if (response.ok) {
        const data: ActiveCallsData = await response.json();
        if (data.success) {
          setActiveCalls(data.data || null);
        }
      }
    } catch (err) {
      console.error('Error fetching active calls:', err);
    }
  };

  const fetchTranscript = async (conversationId: string): Promise<TranscriptResponse['data'] | null> => {
    try {
      const response = await fetch(`/api/elevenlabs/getTranscript?conversationId=${conversationId}`);
      if (response.ok) {
        const data: TranscriptResponse = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching transcript:', err);
      return null;
    }
  };

  const fetchAudio = async (conversationId: string): Promise<AudioResponse['data'] | null> => {
    try {
      const response = await fetch(`/api/elevenlabs/getRecordingAudio?conversationId=${conversationId}`);
      if (response.ok) {
        const data: AudioResponse = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching audio:', err);
      return null;
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchRecordings(),
        fetchUsage(),
        fetchActiveCalls()
      ]);
    } catch (err) {
      setError('Failed to refresh ElevenLabs data');
      console.error('Error refreshing ElevenLabs data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return {
    recordings,
    usage,
    activeCalls,
    loading,
    error,
    fetchRecordings,
    fetchUsage,
    fetchActiveCalls,
    fetchTranscript,
    fetchAudio,
    refreshAll
  };
} 