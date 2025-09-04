"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Send, RefreshCw, MessageCircle, User, Clock, CheckCircle2, Bot, BotOff } from "lucide-react";
import { useFacebookMessages } from "@/hooks/useFacebookMessages";
import { StoredFacebookMessage } from "@/lib/facebookMessageService";
import { useAiEnabledState } from "@/hooks/useLocalStorage";

// Facebook page configurations
const FACEBOOK_PAGES = [
  {
    id: "381898425500628",
    name: "Smile Experts Dental"
  },
  {
    id: "274759011056987", 
    name: "Smile Experts Dental (Dental Office, Washington, DC)"
  }
];

export function FacebookMessagesSection() {
  const {
    conversations,
    totalUnreadCount,
    loading,
    error,
    fetchConversations,
    sendReply,
    markConversationAsRead,
    getConversation
  } = useFacebookMessages();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // AI Auto-Reply State (persistent with localStorage)
  const [aiEnabled, setAiEnabled] = useAiEnabledState('facebook');
  const [processingAiMessages, setProcessingAiMessages] = useState(false);
  
  // N8N Webhook URL from environment
  const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  const selectedConversation = selectedConversationId ? getConversation(selectedConversationId) : null;

  // Check if last message is from customer (not from any Facebook page)
  const isLastMessageFromCustomer = (conversation: any) => {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) return false;
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    // Check if sender_id is not one of the page IDs
    const isFromPage = FACEBOOK_PAGES.some(page => page.id === lastMessage.sender_id);
    return !isFromPage;
  };

  // Get page name by ID
  const getPageName = (pageId: string) => {
    const page = FACEBOOK_PAGES.find(p => p.id === pageId);
    return page?.name || 'Unknown Page';
  };

  // Send message to N8N webhook
  const sendToN8nWebhook = async (message: StoredFacebookMessage, conversationId: string): Promise<string> => {
    if (!n8nWebhookUrl) {
      throw new Error('N8N webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL in your environment variables.');
    }

    try {
      console.log('Sending to N8N webhook:', {
        messageId: message.message_id,
        platform: 'facebook',
        senderId: message.sender_id,
        senderName: message.sender_name,
        content: message.message_text,
        timestamp: message.timestamp,
        conversationId: conversationId
      });

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.message_id,
          platform: 'facebook',
          senderId: message.sender_id,
          senderName: message.sender_name,
          content: message.message_text,
          timestamp: message.timestamp,
          conversationId: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('N8N webhook response:', result);
      return result.output || result.reply || "Thank you for your message. We'll get back to you soon.";
    } catch (error) {
      console.error('Error sending to N8N webhook:', error);
      throw error;
    }
  };

  // Send AI reply to customer
  const sendAiReply = async (conversationId: string, recipientId: string, aiReplyText: string, pageId?: string) => {
    try {
      console.log(`Sending AI reply to conversation ${conversationId}:`, aiReplyText);
      const success = await sendReply(recipientId, aiReplyText, conversationId, pageId);
      
      if (success) {
        console.log(`AI reply sent successfully to conversation ${conversationId}`);
        return true;
      } else {
        throw new Error('Failed to send AI reply');
      }
    } catch (error) {
      console.error('Error sending AI reply:', error);
      throw error;
    }
  };

  // Process conversation for auto-reply
  const processConversationForAutoReply = async (conversation: any) => {
    if (!aiEnabled || !isLastMessageFromCustomer(conversation)) {
      return;
    }

    try {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      
      console.log('Checking message for auto-reply:', {
        messageId: lastMessage.message_id,
        senderId: lastMessage.sender_id,
        isFromCustomer: isLastMessageFromCustomer(conversation),
        isReplied: lastMessage.is_replied,
        timestamp: lastMessage.timestamp
      });

      // Check if already replied
      if (lastMessage.is_replied) {
        console.log('Message already replied, skipping');
        return;
      }

      // Check if message is recent (within last 10 minutes) to avoid replying to old messages
      const messageTime = new Date(lastMessage.timestamp).getTime();
      const now = new Date().getTime();
      const tenMinutesAgo = now - (10 * 60 * 1000);
      
      if (messageTime < tenMinutesAgo) {
        console.log('Message is too old, skipping auto-reply');
        return;
      }

      console.log(`Processing auto-reply for conversation ${conversation.conversationId}`);
      
      // Get AI reply from N8N
      const aiReply = await sendToN8nWebhook(lastMessage, conversation.conversationId);
      
      if (aiReply && aiReply.trim()) {
        // Send the AI reply using the page ID from the conversation
        await sendAiReply(conversation.conversationId, lastMessage.sender_id, aiReply, conversation.pageId);
      } else {
        console.log('No AI reply received or empty reply');
      }
      
    } catch (error) {
      console.error(`Failed to process auto-reply for conversation ${conversation.conversationId}:`, error);
    }
  };

  // Monitor conversations for auto-reply when AI is enabled
  useEffect(() => {
    if (!aiEnabled || !conversations.length) return;

    console.log('Monitoring conversations for auto-reply:', conversations.length);

    // Process each conversation
    conversations.forEach(conversation => {
      if (isLastMessageFromCustomer(conversation)) {
        console.log(`Customer message detected in conversation ${conversation.conversationId}`);
        processConversationForAutoReply(conversation);
      }
    });
  }, [conversations, aiEnabled]);

  // Handle AI toggle
  const handleAiToggle = async () => {
    if (!n8nWebhookUrl) {
      alert('N8N webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL in your environment variables.');
      return;
    }

    const newAiState = !aiEnabled;
    setAiEnabled(newAiState);

    console.log(`AI auto-reply ${newAiState ? 'enabled' : 'disabled'}`);

    // Send webhook to external service
    try {
      const webhookResponse = await fetch('https://ows23hph.rpcl.host/webhook/d40ae863-6cc6-4d93-b8ed-f9ea11f5c1f7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: newAiState ? 'ACTIVATE' : 'DEACTIVATE'
        }),
      });

      if (!webhookResponse.ok) {
        console.error('Failed to send webhook to external service:', webhookResponse.statusText);
      } else {
        console.log(`Webhook sent successfully: ${newAiState ? 'ACTIVATE' : 'DEACTIVATE'}`);
      }
    } catch (error) {
      console.error('Error sending webhook to external service:', error);
    }

    if (newAiState) {
      setProcessingAiMessages(true);
      
      // Process existing unreplied conversations
      for (const conversation of conversations) {
        if (isLastMessageFromCustomer(conversation) && !conversation.isReplied) {
          try {
            await processConversationForAutoReply(conversation);
            // Add delay to avoid overwhelming the APIs
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error processing conversation ${conversation.conversationId}:`, error);
          }
        }
      }
      
      setProcessingAiMessages(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    markConversationAsRead(conversationId);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    setSendingReply(true);
    try {
      // Get the recipient ID (first participant that's not a page)
      const recipientMessage = selectedConversation.messages.find(
        msg => !FACEBOOK_PAGES.some(page => page.id === msg.sender_id)
      );
      
      if (!recipientMessage) {
        throw new Error('Could not find recipient');
      }

      const success = await sendReply(
        recipientMessage.sender_id,
        replyText,
        selectedConversation.conversationId,
        selectedConversation.pageId
      );

      if (success) {
        setReplyText("");
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const renderMessage = (message: StoredFacebookMessage, isLast: boolean) => {
    // Check if message is from a page (sent by us) or from a user (received)
    const isFromPage = FACEBOOK_PAGES.some(page => page.id === message.sender_id);
    const isReplied = message.is_replied;

    return (
      <div
        key={message.message_id}
        className={`flex ${isFromPage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isFromPage ? 'order-2' : 'order-1'}`}>
          {!isFromPage && (
            <div className="text-xs text-muted-foreground mb-1 px-1">
              {message.sender_name}
            </div>
          )}
          <div
            className={`px-4 py-2 rounded-lg ${
              isFromPage
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-foreground border border-border'
            }`}
          >
            <p className="text-sm">{message.message_text}</p>
            
            {/* Render attachments if any */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="text-xs opacity-75">
                    📎 {attachment.type} attachment
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
            isFromPage ? 'justify-end' : 'justify-start'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isFromPage && (
              <div className="flex items-center gap-1">
                {isReplied && <CheckCircle2 className="h-3 w-3 text-green-500" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderConversationList = () => {
    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <MessageCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Error loading conversations</p>
          <Button onClick={fetchConversations} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No conversations found</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.conversationId}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedConversationId === conversation.conversationId
                ? 'bg-blue-50 border-blue-200'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleConversationClick(conversation.conversationId)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {conversation.participants.filter(p => !FACEBOOK_PAGES.some(page => page.name === p))[0] || 'Unknown User'}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1 py-0 flex-shrink-0">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                      {conversation.isReplied && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      )}
                      {/* Show AI indicator if last message is from customer and AI is enabled */}
                      {aiEnabled && isLastMessageFromCustomer(conversation) && (
                        <div title="AI will auto-reply" className="flex-shrink-0">
                          <Bot className="h-3 w-3 text-green-500" />
                        </div>
                      )}
                    </div>
                    {/* Show page badge on a separate line for better responsiveness */}
                    {conversation.pageName && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {conversation.pageName}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatLastMessageTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {conversation.lastMessage.message_text || 'Media message'}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {conversation.messages.length} messages
                  </span>
                  <Clock className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Facebook className="h-6 w-6 text-blue-600" />
            Facebook Messages
          </h2>
          <p className="text-gray-600">
            Manage Facebook Messenger conversations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Toggle Button */}
          <Button 
            onClick={handleAiToggle} 
            variant={aiEnabled ? "default" : "outline"} 
            size="sm"
            disabled={processingAiMessages}
            className={aiEnabled ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {aiEnabled ? (
              <>
                <Bot className="h-4 w-4 mr-2" />
                AI Enabled
              </>
            ) : (
              <>
                <BotOff className="h-4 w-4 mr-2" />
                Enable AI
              </>
            )}
          </Button>
          
          <Button onClick={fetchConversations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {totalUnreadCount > 0 && (
            <Badge variant="destructive">
              {totalUnreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* AI Status Card */}
      {aiEnabled && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Facebook AI Auto-Reply Enabled
                </p>
                <p className="text-xs text-green-600">
                  {processingAiMessages 
                    ? "Processing unreplied messages..." 
                    : "New customer messages will be automatically replied to using AI"
                  }
                </p>
              </div>
              {processingAiMessages && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <CardDescription>
              {conversations.length} total conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {renderConversationList()}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedConversation 
                ? `Chat with ${selectedConversation.participants.filter(p => !FACEBOOK_PAGES.some(page => page.name === p))[0] || 'Unknown User'}`
                : 'Select a conversation'
              }
            </CardTitle>
            {selectedConversation && (
              <CardDescription>
                {selectedConversation.messages.length} messages • Last active {formatLastMessageTime(selectedConversation.lastMessage.timestamp)}
                {selectedConversation.pageName && (
                  <span> • {selectedConversation.pageName}</span>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedConversation ? (
              <div className="space-y-4">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto border rounded-lg p-4">
                  {selectedConversation.messages.map((message, index) => 
                    renderMessage(message, index === selectedConversation.messages.length - 1)
                  )}
                </div>

                {/* Reply Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Reply:</label>
                    {aiEnabled && (
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        AI Auto-Reply Active
                      </div>
                    )}
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full h-20 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Press Enter to send, Shift+Enter for new line
                    </span>
                    <Button 
                      onClick={handleSendReply} 
                      disabled={!replyText.trim() || sendingReply}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendingReply ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
