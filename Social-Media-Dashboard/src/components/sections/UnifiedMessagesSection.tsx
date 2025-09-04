"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Mail, MessageCircle, Send, RefreshCw, AlertCircle, Bot, BotOff } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useGmail } from "@/hooks/useGmail";
import { FacebookMessagesSection } from "./FacebookMessagesSection";
import { InstagramMessagesSection } from "./InstagramMessagesSection";
import { useAiEnabledState } from "@/hooks/useLocalStorage";

interface UnifiedMessage {
  id: string;
  platform: 'facebook' | 'instagram' | 'gmail';
  senderId: string;
  senderName: string;
  senderEmail?: string;
  subject?: string;
  content: {
    text: string;
    attachments?: Array<{
      type: string;
      url: string;
      name?: string;
    }>;
  };
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  conversationId: string;
  isRead: boolean;
  isReplied: boolean;
}

interface MessageInput {
  id: string;
  platform: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  subject?: string;
  content: { text: string; attachments?: Array<{ type: string; url: string; name?: string }> };
  timestamp: string;
  conversationId: string;
  isRead: boolean;
  isReplied: boolean;
}

interface EmailInput {
  id: string;
  sender: { email: string; name: string };
  subject: string;
  body: string;
  attachments?: Array<{ type: string; url: string; name?: string }>;
  timestamp: string;
  status: string;
  threadId: string;
}

export function UnifiedMessagesSection() {
  const { 
    messages, 
    loading: messagesLoading, 
    error: messagesError, 
    fetchMessages, 
    sendReply: sendSocialReply, 
    markAsRead 
  } = useMessages();

  const {
    emails,
    loading: gmailLoading,
    backgroundLoading: gmailBackgroundLoading,
    error: gmailError,
    isAuthenticated: gmailAuthenticated,
    authenticateGmail,
    fetchEmails,
    sendReply: sendGmailReply
  } = useGmail();

  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  
  // AI Toggle State (persistent with localStorage)
  const [aiEnabled, setAiEnabled] = useAiEnabledState('social');
  const [processingAiMessages, setProcessingAiMessages] = useState(false);
  
  // Gmail AI Toggle State (persistent with localStorage)
  const [gmailAiEnabled, setGmailAiEnabled] = useAiEnabledState('gmail');
  const [gmailAiProcessing, setGmailAiProcessing] = useState(false);
  
  // N8N Webhook URL from environment only
  const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  // Gmail AI Webhook URL (hardcoded as requested)
  const gmailAiWebhookUrl = "https://ows23hph.rpcl.host/webhook/d40ae863-6cc6-4d93-b8ed-f9ea11f5c1f7";

  // Transform backend messages to match frontend interface
  const transformMessage = useCallback((msg: MessageInput): UnifiedMessage => ({
    id: msg.id,
    platform: msg.platform as 'facebook' | 'instagram' | 'gmail',
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderEmail: msg.senderEmail,
    subject: msg.subject,
    content: msg.content,
    timestamp: msg.timestamp,
    status: msg.isRead ? (msg.isReplied ? 'replied' : 'read') : 'unread',
    conversationId: msg.conversationId,
    isRead: msg.isRead,
    isReplied: msg.isReplied
  }), []);

  // Transform Gmail emails to unified message format
  const transformGmailToMessage = useCallback((email: EmailInput): UnifiedMessage => ({
    id: `gmail_${email.id}`,
    platform: 'gmail',
    senderId: email.sender.email,
    senderName: email.sender.name,
    senderEmail: email.sender.email,
    subject: email.subject,
    content: {
      text: email.body,
      attachments: email.attachments || []
    },
    timestamp: email.timestamp,
    status: email.status === 'unread' ? 'unread' : 'read',
    conversationId: email.threadId,
    isRead: email.status !== 'unread',
    isReplied: false
  }), []);

  // Separate messages by platform
  const socialMessages = messages.map(transformMessage);
  const gmailMessages = emails.map(transformGmailToMessage);
  
  const facebookMessages = socialMessages.filter(msg => msg.platform === 'facebook');
  const instagramMessages = socialMessages.filter(msg => msg.platform === 'instagram');

  // Calculate unread counts for each platform
  const facebookUnreadCount = facebookMessages.filter(msg => msg.status === 'unread').length;
  const instagramUnreadCount = instagramMessages.filter(msg => msg.status === 'unread').length;
  const gmailUnreadCount = gmailMessages.filter(msg => msg.status === 'unread').length;

  // Fetch emails when authenticated status changes to true
  useEffect(() => {
    if (gmailAuthenticated) {
      fetchEmails({ limit: 20 }); // Initial load shows loading screen
    }
  }, [gmailAuthenticated, fetchEmails]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'gmail':
        return <Mail className="h-4 w-4 text-red-600" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const filterMessages = (messages: UnifiedMessage[]) => {
    return messages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleReply = async () => {
    if (replyText.trim() && selectedMessage) {
      setSendingReply(true);
      try {
        if (selectedMessage.platform === 'gmail') {
          await sendGmailReply({
            threadId: selectedMessage.conversationId,
            replyText,
            recipientEmail: selectedMessage.senderEmail || '',
            subject: selectedMessage.subject || ''
          });
        } else {
          const success = await sendSocialReply(
            selectedMessage.senderId, 
            replyText, 
            selectedMessage.platform
          );
          if (!success) throw new Error('Failed to send reply');
        }
        
        setReplyText("");
        alert('Reply sent successfully!');
        
        if (selectedMessage) {
          setSelectedMessage({
            ...selectedMessage,
            status: 'replied',
            isReplied: true
          });
        }
        
        fetchMessages();
        
      } catch (error) {
        console.error('Error sending reply:', error);
        alert('Failed to send reply. Please try again.');
      } finally {
        setSendingReply(false);
      }
    }
  };

  const handleMessageClick = (message: UnifiedMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const handleRefresh = () => {
    fetchMessages();
    if (gmailAuthenticated) {
      fetchEmails({ limit: 20, background: true }); // Smooth refresh without loading screen
    }
  };

  const renderMessageList = (messages: UnifiedMessage[], platform: string) => {
    const filteredMessages = filterMessages(messages);

    if (filteredMessages.length === 0) {
      return (
        <div className="text-center py-6 sm:py-8 text-muted-foreground">
          <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm sm:text-base">No {platform} messages found</p>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 sm:space-y-2">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedMessage?.id === message.id 
                ? 'bg-primary/10 border-primary' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleMessageClick(message)}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {getPlatformIcon(message.platform)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-xs sm:text-sm truncate">
                      {message.senderName}
                    </span>
                    <Badge 
                      variant={message.status === 'unread' ? 'destructive' : 'secondary'}
                      className="text-xs px-1 py-0 shrink-0"
                    >
                      {message.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 self-start sm:self-auto">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                {message.subject && (
                  <p className="text-xs sm:text-sm font-medium text-foreground/90 mt-1 truncate">
                    {message.subject}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {message.content.text}
                </p>
                
                {message.content.attachments && message.content.attachments.length > 0 && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {message.content.attachments.length} attachment{message.content.attachments.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // N8N Webhook Integration
  const sendToN8nWebhook = async (message: UnifiedMessage): Promise<string> => {
    if (!n8nWebhookUrl) {
      throw new Error('N8N webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL in your environment variables.');
    }

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.id,
          platform: message.platform,
          senderId: message.senderId,
          senderName: message.senderName,
          senderEmail: message.senderEmail,
          subject: message.subject,
          content: message.content,
          timestamp: message.timestamp,
          conversationId: message.conversationId
        }),
      });

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.aiReply || result.reply || "Thank you for your message. We'll get back to you soon.";
    } catch (error) {
      console.error('Error sending to N8N webhook:', error);
      throw error;
    }
  };

  const sendAiReply = async (message: UnifiedMessage, aiReplyText: string) => {
    try {
      if (message.platform === 'gmail') {
        await sendGmailReply({
          threadId: message.conversationId,
          replyText: aiReplyText,
          recipientEmail: message.senderEmail || '',
          subject: message.subject ? `Re: ${message.subject}` : 'Re: Your message'
        });
      } else {
        const success = await sendSocialReply(
          message.senderId, 
          aiReplyText, 
          message.platform
        );
        if (!success) throw new Error('Failed to send AI reply');
      }

      // Mark message as replied
      markAsRead(message.id);
      console.log(`AI reply sent to ${message.senderName} on ${message.platform}`);
    } catch (error) {
      console.error('Error sending AI reply:', error);
      throw error;
    }
  };

  const processOldMessages = async () => {
    if (!aiEnabled) return;

    setProcessingAiMessages(true);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // Get all messages (social + gmail)
      const allMessages = [...socialMessages, ...gmailMessages];
      
      // Filter messages: older than 24 hours and not replied
      const oldUnrepliedMessages = allMessages.filter(message => {
        const messageDate = new Date(message.timestamp);
        return messageDate < twentyFourHoursAgo && !message.isReplied;
      });

      console.log(`Processing ${oldUnrepliedMessages.length} old unreplied messages`);

      // Process each message
      for (const message of oldUnrepliedMessages) {
        try {
          const aiReply = await sendToN8nWebhook(message);
          await sendAiReply(message, aiReply);
          
          // Add a small delay to avoid overwhelming the APIs
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to process message ${message.id}:`, error);
        }
      }

      // Refresh messages to show updated status
      fetchMessages();
      if (gmailAuthenticated) {
        fetchEmails({ limit: 20, background: true }); // Background refresh during AI processing
      }

    } catch (error) {
      console.error('Error processing old messages:', error);
      alert('Error processing old messages. Please try again.');
    } finally {
      setProcessingAiMessages(false);
    }
  };

  const handleNewMessageAiReply = async (message: UnifiedMessage) => {
    if (!aiEnabled) return;

    try {
      const aiReply = await sendToN8nWebhook(message);
      await sendAiReply(message, aiReply);
    } catch (error) {
      console.error('Error handling new message with AI:', error);
    }
  };

  const handleAiToggle = async () => {
    if (!n8nWebhookUrl) {
      alert('N8N webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL in your environment variables.');
      return;
    }

    const newAiState = !aiEnabled;
    setAiEnabled(newAiState);

    if (newAiState) {
      // When AI is enabled, process old messages
      await processOldMessages();
    }
  };

  // Gmail AI Toggle Handler
  const handleGmailAiToggle = async () => {
    const newGmailAiState = !gmailAiEnabled;
    setGmailAiProcessing(true);

    try {
      console.log(`Attempting to ${newGmailAiState ? 'activate' : 'deactivate'} Gmail AI...`);
      console.log('Webhook URL:', gmailAiWebhookUrl);
      
      const requestBody = {
        action: newGmailAiState ? "ACTIVATE" : "DEACTIVATE"
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch(gmailAiWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);

      if (!response.ok) {
        // Try to get response text for more details
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Gmail AI webhook failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Try to parse response
      const responseData = await response.text();
      console.log('Response data:', responseData);

      setGmailAiEnabled(newGmailAiState);
      console.log(`Gmail AI ${newGmailAiState ? 'activated' : 'deactivated'} successfully`);
      alert(`Gmail AI ${newGmailAiState ? 'activated' : 'deactivated'} successfully!`);
      
    } catch (error) {
      console.error('Error toggling Gmail AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to ${newGmailAiState ? 'activate' : 'deactivate'} Gmail AI. Error: ${errorMessage}`);
    } finally {
      setGmailAiProcessing(false);
    }
  };

  // Monitor for new messages when AI is enabled
  useEffect(() => {
    if (!aiEnabled) return;

    const allMessages = [...socialMessages, ...gmailMessages];
    const recentMessages = allMessages.filter(message => {
      const messageDate = new Date(message.timestamp);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return messageDate > fiveMinutesAgo && !message.isReplied && message.status === 'unread';
    });

    // Auto-reply to recent unread messages
    recentMessages.forEach(message => {
      handleNewMessageAiReply(message);
    });
  }, [messages, emails, aiEnabled]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Enhanced Header Section - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg self-start">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Unified Message Manager</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                Centralized communication hub for all your patient interactions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white/70 hover:bg-white border-white/50"
              disabled={messagesLoading || gmailLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(messagesLoading || gmailLoading) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh All</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
        </div>
        
        {/* Quick Stats - Compact */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {facebookUnreadCount} Facebook
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {instagramUnreadCount} Instagram
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {gmailUnreadCount} Gmail
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Total: {facebookUnreadCount + instagramUnreadCount + gmailUnreadCount} unread
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced AI Status Section - Compact */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        {/* Social Media AI Control */}
        <Card className={`transition-all duration-300 ${aiEnabled ? 'border-green-300 bg-green-50 shadow-green-100' : 'border-gray-200 bg-gray-50'}`}>
          <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${aiEnabled ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {aiEnabled ? <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" /> : <BotOff className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Social Media AI</h3>
                  <p className="text-xs text-gray-600">Facebook & Instagram auto-replies</p>
                </div>
              </div>
              <Button 
                onClick={handleAiToggle} 
                variant={aiEnabled ? "default" : "outline"} 
                size="sm"
                disabled={processingAiMessages || !n8nWebhookUrl}
                className={`${aiEnabled ? "bg-green-600 hover:bg-green-700" : ""} self-start sm:self-auto shrink-0`}
              >
                {processingAiMessages ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : aiEnabled ? (
                  "AI On"
                ) : (
                  <span className="hidden sm:inline">Enable AI</span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4 sm:pt-0">
            <div className={`p-2 rounded-lg border ${aiEnabled ? 'bg-green-100 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
              <p className={`text-xs ${aiEnabled ? 'text-green-800' : 'text-gray-600'}`}>
                {aiEnabled 
                  ? processingAiMessages 
                    ? "🔄 Processing old unreplied messages..." 
                    : "✅ Monitoring for new messages and auto-replying"
                  : "💤 AI assistant is currently disabled"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gmail AI Control */}
        <Card className={`transition-all duration-300 ${gmailAiEnabled ? 'border-red-300 bg-red-50 shadow-red-100' : 'border-gray-200 bg-gray-50'}`}>
          <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${gmailAiEnabled ? 'bg-red-500' : 'bg-gray-400'}`}>
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Gmail AI</h3>
                  <p className="text-xs text-gray-600">Email auto-reply system</p>
                </div>
              </div>
              <Button 
                onClick={handleGmailAiToggle} 
                variant={gmailAiEnabled ? "default" : "outline"} 
                size="sm"
                disabled={gmailAiProcessing || !gmailAuthenticated}
                className={`${gmailAiEnabled ? "bg-red-600 hover:bg-red-700" : ""} self-start sm:self-auto shrink-0`}
              >
                {gmailAiProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="hidden sm:inline">{gmailAiEnabled ? "Disabling..." : "Enabling..."}</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : gmailAiEnabled ? (
                  "AI On"
                ) : (
                  <span className="hidden sm:inline">Enable AI</span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4 sm:pt-0">
            <div className={`p-2 rounded-lg border ${gmailAiEnabled ? 'bg-red-100 border-red-200' : 'bg-gray-100 border-gray-200'}`}>
              <p className={`text-xs ${gmailAiEnabled ? 'text-red-800' : 'text-gray-600'}`}>
                {gmailAiEnabled 
                  ? "✅ Gmail AI is active and monitoring emails"
                  : gmailAuthenticated 
                    ? "💤 Gmail AI is currently disabled" 
                    : "⚠️ Please authenticate Gmail first"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Platform Sections - Compact */}
      <div className="space-y-4 sm:space-y-5">
        {/* Facebook Messages Section - Compact */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 bg-blue-500 rounded-lg shrink-0">
                  <Facebook className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">Facebook Messages</h2>
                  <p className="text-xs text-gray-600">Patient conversations from Facebook Messenger</p>
                </div>
              </div>
              {facebookUnreadCount > 0 && (
                <Badge variant="destructive" className="px-1.5 sm:px-2 py-0.5 text-xs self-start sm:self-auto">
                  {facebookUnreadCount} unread
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <FacebookMessagesSection />
          </div>
        </div>

        {/* Instagram Messages Section - Compact */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-pink-50 to-purple-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-pink-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shrink-0">
                  <Instagram className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">Instagram Messages</h2>
                  <p className="text-xs text-gray-600">Direct messages from Instagram Business</p>
                </div>
              </div>
              {instagramUnreadCount > 0 && (
                <Badge variant="destructive" className="px-1.5 sm:px-2 py-0.5 text-xs self-start sm:self-auto">
                  {instagramUnreadCount} unread
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <InstagramMessagesSection />
          </div>
        </div>

        {/* Gmail Messages Section - Compact */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-red-50 to-orange-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-red-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 bg-red-500 rounded-lg shrink-0">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">Gmail Messages</h2>
                  <p className="text-xs text-gray-600">Email communications with patients</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {gmailBackgroundLoading && (
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                    <RefreshCw className="h-2 w-2 sm:h-2.5 sm:w-2.5 animate-spin" />
                    <span className="hidden sm:inline">Syncing...</span>
                    <span className="sm:hidden">Sync</span>
                  </div>
                )}
                {gmailUnreadCount > 0 && (
                  <Badge variant="destructive" className="px-1.5 sm:px-2 py-0.5 text-xs">
                    {gmailUnreadCount} unread
                  </Badge>
                )}
                {gmailAiEnabled && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 text-xs">
                    <span className="hidden sm:inline">AI Active</span>
                    <span className="sm:hidden">AI</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            {/* Gmail Auth Check - Responsive */}
            {!gmailAuthenticated ? (
              <div className="text-center py-8 sm:py-12">
                <Mail className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Gmail Not Connected</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">Connect your Gmail account to manage email communications</p>
                <Button onClick={authenticateGmail} className="bg-red-600 hover:bg-red-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Connect Gmail
                </Button>
              </div>
            ) : gmailLoading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-red-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading Gmail messages...</p>
              </div>
            ) : gmailError ? (
              <div className="text-center py-8 sm:py-12">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-red-400" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Gmail Connection Error</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">{gmailError}</p>
                <Button onClick={authenticateGmail} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconnect Gmail
                </Button>
              </div>
            ) : (
              <div>
                {renderMessageList(gmailMessages, 'gmail')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Panel - Compact */}
      {selectedMessage && (
        <Card className="mt-4 sm:mt-5">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedMessage.platform)}
                <span className="truncate text-sm sm:text-base">
                  {selectedMessage.subject || `Message from ${selectedMessage.senderName}`}
                </span>
              </div>
              {aiEnabled && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 self-start sm:self-auto">
                  <Bot className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">AI Available</span>
                  <span className="sm:hidden">AI</span>
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              <span className="break-all">{selectedMessage.senderEmail || selectedMessage.senderId}</span>
              <span className="mx-1 hidden sm:inline">•</span>
              <span className="block sm:inline">{formatTime(selectedMessage.timestamp)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-3 sm:p-4">
            <div className="bg-muted/30 p-2 sm:p-3 rounded-lg">
              <p className="whitespace-pre-wrap text-xs sm:text-sm">{selectedMessage.content.text}</p>
              {selectedMessage.content.attachments && selectedMessage.content.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium">Attachments:</p>
                  {selectedMessage.content.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{attachment.name || `Attachment ${index + 1}`}</span>
                      <Badge variant="outline" className="text-xs shrink-0">{attachment.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-medium">Reply:</label>
                {aiEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start sm:self-auto"
                    onClick={async () => {
                      try {
                        const aiReply = await sendToN8nWebhook(selectedMessage);
                        setReplyText(aiReply);
                      } catch (error) {
                        console.error('Error generating AI reply:', error);
                        alert('Failed to generate AI reply. Please try again.');
                      }
                    }}
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Generate AI Reply</span>
                    <span className="sm:hidden">AI Reply</span>
                  </Button>
                )}
              </div>
              
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="w-full min-h-[60px] sm:min-h-[80px] p-2 sm:p-3 text-xs sm:text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedMessage(null)}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  {sendingReply ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}