export interface ElevenLabsConversationData {
  conversation_id?: string;
  agent_id?: string;
  agent_name?: string;
  status?: string;
  call_duration_secs?: number;
  conversation_summary?: string;
  summary?: string;
  transcript?: TranscriptEntry[];
  messages?: MessageEntry[];
  conversation_history?: ConversationHistoryEntry[];
  analysis?: {
    summary?: string;
  };
  evaluation_result?: {
    summary?: string;
    transcript_summary?: string;
  };
  call_analysis?: {
    summary?: string;
  };
  metadata?: {
    summary?: string;
    call_duration_secs?: number;
  };
}

export interface TranscriptEntry {
  role?: string;
  user_id?: string;
  message?: string;
  content?: string;
}

export interface MessageEntry {
  role?: string;
  user_id?: string;
  message?: string;
  content?: string;
}

export interface ConversationHistoryEntry {
  from?: string;
  text?: string;
}

export interface ElevenLabsAgentData {
  name?: string;
  agent_name?: string;
}

export interface TranscriptResponse {
  success: boolean;
  data?: {
    transcript: string;
    summary: string;
    raw_conversation_data: ElevenLabsConversationData;
    conversation_id: string;
    agent_name: string;
    duration: number;
    status: string;
  };
  error?: string;
}

export interface AudioResponse {
  success: boolean;
  data?: {
    audio_base64: string;
    content_type: string;
    conversation_id?: string;
  };
  error?: string;
}

export interface RecordingData {
  conversation_id: string;
  agent_id?: string;
  agent_name: string;
  start_time_unix_secs: number;
  call_duration_secs: number;
  status: string;
  user_phone?: string | null;
}

export interface ElevenLabsUsageData {
  success: boolean;
  data?: {
    total_calls: number;
    total_duration: number;
    usage_by_date: Record<string, number>;
    agent_usage: Record<string, number>;
  };
  error?: string;
}

export interface ActiveCallsData {
  success: boolean;
  data?: {
    active_calls: number;
    calls_in_progress: RecordingData[];
  };
  error?: string;
}
