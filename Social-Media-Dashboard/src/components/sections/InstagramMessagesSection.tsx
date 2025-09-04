"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Send, RefreshCw, MessageCircle, User, Clock, CheckCircle2, Bot, BotOff } from "lucide-react";
import { useInstagramMessages } from "@/hooks/useInstagramMessages";
import { StoredInstagramMessage, InstagramMessageService } from "@/lib/instagramMessageService";
import { useAiEnabledState } from "@/hooks/useLocalStorage";

export function InstagramMessagesSection() {
  const {
    conversations,
    totalUnreadCount,
    loading,
    error,
    fetchConversations,
    sendReply,
    markConversationAsRead,
    getConversation,
    processAiAutoReply
  } = useInstagramMessages();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // AI Auto-Reply State (persistent with localStorage)
  const [aiEnabled, setAiEnabled] = useAiEnabledState('instagram');
  const [processingAiMessages, setProcessingAiMessages] = useState(false);
  
  // N8N Webhook URL from environment
  const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  // Instagram Business Account ID
  const instagramBusinessAccountId = InstagramMessageService.getBusinessAccountId();

  const selectedConversation = selectedConversationId ? getConversation(selectedConversationId) : null;

  // Check if last message is from customer (not from Instagram business account)
  const isLastMessageFromCustomer = (conversation: any) => {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) return false;
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    // Check if sender_id is different from business account ID
    return !InstagramMessageService.isFromBusinessAccount(lastMessage.sender_id);
  };

  // Send message to N8N webhook
  const sendToN8nWebhook = async (message: StoredInstagramMessage, conversationId: string): Promise<string> => {
    if (!n8nWebhookUrl) {
      throw new Error('N8N webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL in your environment variables.');
    }

    try {
      console.log('🧠 Sending Instagram message to N8N webhook for AI response...');
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.message_id,
          platform: 'instagram',
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
      console.error('❌ N8N webhook error:', error);
      throw error;
    }
  };

  // Send AI reply to customer
  const sendAiReply = async (conversationId: string, recipientId: string, aiReplyText: string) => {
    try {
      console.log(`Sending AI reply to Instagram conversation ${conversationId}:`, aiReplyText);
      const success = await sendReply(recipientId, aiReplyText, conversationId);
      
      if (success) {
        console.log(`AI reply sent successfully to Instagram conversation ${conversationId}`);
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
      
      console.log('Checking Instagram message for auto-reply:', {
        messageId: lastMessage.message_id,
        senderId: lastMessage.sender_id,
        businessAccountId: instagramBusinessAccountId,
        isFromCustomer: !InstagramMessageService.isFromBusinessAccount(lastMessage.sender_id),
        isReplied: lastMessage.is_replied,
        timestamp: lastMessage.timestamp
      });

      // Check if already replied
      if (lastMessage.is_replied) {
        console.log('Instagram message already replied, skipping');
        return;
      }

      // Check if message is recent (within last 10 minutes) to avoid replying to old messages
      const messageTime = new Date(lastMessage.timestamp).getTime();
      const now = new Date().getTime();
      const tenMinutesAgo = now - (10 * 60 * 1000);
      
      if (messageTime < tenMinutesAgo) {
        console.log('Instagram message is too old, skipping auto-reply');
        return;
      }

      console.log(`Processing Instagram auto-reply for conversation ${conversation.conversationId}`);
      
      // Get AI reply from N8N
      const aiReply = await sendToN8nWebhook(lastMessage, conversation.conversationId);
      
      if (aiReply && aiReply.trim()) {
        // Send the AI reply
        await sendAiReply(conversation.conversationId, lastMessage.sender_id, aiReply);
      } else {
        console.log('No AI reply received or empty reply');
      }
      
    } catch (error) {
      console.error(`Failed to process auto-reply for Instagram conversation ${conversation.conversationId}:`, error);
    }
  };

  // Handle AI Toggle
  const handleAiToggle = async () => {
    if (!n8nWebhookUrl) {
      alert('N8N webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL in your environment variables.');
      return;
    }

    if (!instagramBusinessAccountId) {
      alert('Instagram Business Account ID not configured.');
      return;
    }

    const newAiState = !aiEnabled;
    setAiEnabled(newAiState);

    console.log(`Instagram AI auto-reply ${newAiState ? 'enabled' : 'disabled'}`);

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
            console.error(`Error processing Instagram conversation ${conversation.conversationId}:`, error);
          }
        }
      }
      
      setProcessingAiMessages(false);
    }
  };

  // Monitor conversations for auto-reply when AI is enabled
  useEffect(() => {
    if (!aiEnabled || !conversations.length) return;

    console.log('Monitoring Instagram conversations for auto-reply:', conversations.length);

    // Process each conversation
    conversations.forEach(conversation => {
      if (isLastMessageFromCustomer(conversation)) {
        console.log(`Customer message detected in Instagram conversation ${conversation.conversationId}`);
        processConversationForAutoReply(conversation);
      }
    });
  }, [conversations, aiEnabled]);

  // Process AI for specific conversation
  const processAiForConversation = async (conversationId: string) => {
    const conversation = getConversation(conversationId);
    if (!conversation) return;

    // Find the last unreplied message from customer
    const unrepliedMessages = conversation.messages.filter(msg => 
      !msg.is_replied && 
      !InstagramMessageService.isFromBusinessAccount(msg.sender_id) && 
      msg.message_text && 
      msg.message_text.trim().length > 0
    );

    if (unrepliedMessages.length === 0) {
      console.log('No unreplied Instagram messages found in this conversation');
      return;
    }

    const lastUnrepliedMessage = unrepliedMessages[unrepliedMessages.length - 1];

    try {
      setProcessingAiMessages(true);
      
      // Get AI response
      const aiReply = await sendToN8nWebhook(lastUnrepliedMessage, conversationId);
      
      if (aiReply) {
        // Send the AI reply
        const success = await sendReply(
          lastUnrepliedMessage.sender_id,
          aiReply,
          conversationId
        );

        if (success) {
          console.log('✅ AI reply sent successfully for Instagram conversation');
        }
      }
    } catch (error) {
      console.error('❌ Failed to process AI for Instagram conversation:', error);
    } finally {
      setProcessingAiMessages(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    setSendingReply(true);
    try {
      // Get the recipient ID (first participant that's not the business account)
      const recipientMessage = selectedConversation.messages.find(
        msg => msg.sender_id !== msg.receipt_id
      );
      
      if (!recipientMessage) {
        throw new Error('Could not find recipient');
      }

      const success = await sendReply(
        recipientMessage.sender_id,
        replyText,
        selectedConversation.conversationId
      );

      if (success) {
        setReplyText("");
      }
    } catch (error) {
      console.error('Error sending Instagram reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const renderMessage = (message: StoredInstagramMessage, isLast: boolean) => {
    // Check if message is from the business account (sent by us) or from a user (received)
    // Use business account ID to determine if message is from our page
    const isFromBusinessAccount = InstagramMessageService.isFromBusinessAccount(message.sender_id);
    const isReplied = message.is_replied;

    return (
      <div
        key={message.message_id}
        className={`flex ${isFromBusinessAccount ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isFromBusinessAccount ? 'order-2' : 'order-1'}`}>
          {!isFromBusinessAccount && (
            <div className="text-xs text-muted-foreground mb-1 px-1">
              {message.sender_name}
            </div>
          )}
          <div
            className={`px-4 py-2 rounded-lg ${
              isFromBusinessAccount
                ? 'bg-purple-500 text-white'
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
          
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
            isFromBusinessAccount ? 'justify-end' : 'justify-start'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isFromBusinessAccount && (
              <div className="flex items-center gap-1">
                {isReplied && <CheckCircle2 className="h-3 w-3 text-green-500" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Instagram className="h-6 w-6 text-purple-600" />
            Instagram Messages
          </h2>
          <p className="text-gray-600">
            Manage Instagram Direct Messages
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
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-800">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">
                Instagram AI Auto-Reply is Active
              </span>
              {processingAiMessages && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              )}
            </div>
            <p className="text-xs text-green-600 mt-1">
              New Instagram messages will receive automatic AI responses
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Threads List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Message Threads
            </CardTitle>
            <CardDescription>
              {conversations.length} Instagram conversation threads
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No Instagram message threads found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start a conversation to see threads here
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const lastMessage = conversation.lastMessage;
                  const isFromCustomer = lastMessage && !InstagramMessageService.isFromBusinessAccount(lastMessage.sender_id);
                  const threadParticipants = conversation.participants.filter(p => p !== 'OfinaPulse' && p !== 'Instagram User');
                  const displayName = threadParticipants.length > 0 ? threadParticipants[0] : 'Instagram User';
                  
                  return (
                    <div
                      key={conversation.conversationId}
                      className={`relative p-4 border-b cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        selectedConversationId === conversation.conversationId 
                          ? 'bg-purple-50 border-purple-200 shadow-sm' 
                          : 'border-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedConversationId(conversation.conversationId);
                        if (conversation.unreadCount > 0) {
                          markConversationAsRead(conversation.conversationId);
                        }
                      }}
                    >
                      {/* Thread indicator line */}
                      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-purple-200"></div>
                      
                      <div className="flex items-start gap-3 ml-2">
                        {/* Profile picture */}
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Thread header */}
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {displayName}
                            </h3>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatTime(lastMessage?.timestamp || "")}
                            </span>
                          </div>
                          
                          {/* Last message preview */}
                          <div className="flex items-center gap-2">
                            {lastMessage && (
                              <>
                                {InstagramMessageService.isFromBusinessAccount(lastMessage.sender_id) && (
                                  <span className="text-xs text-purple-600 font-medium">You:</span>
                                )}
                                <p className="text-xs text-gray-600 truncate flex-1">
                                  {lastMessage.message_text || "📎 Attachment"}
                                </p>
                              </>
                            )}
                          </div>
                          
                          {/* Thread status indicators */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {lastMessage?.replied_by === 'AI' && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  <Bot className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                              {isFromCustomer && !conversation.isReplied && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  Needs Reply
                                </Badge>
                              )}
                              {conversation.isReplied && (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                            
                            {/* AI auto-reply button */}
                            {isFromCustomer && !conversation.isReplied && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  processAiForConversation(conversation.conversationId);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-xs h-6 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                disabled={processingAiMessages}
                              >
                                <Bot className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          {/* Message count */}
                          <div className="text-xs text-gray-400 mt-1">
                            {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread View */}
        <Card className="lg:col-span-2 flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0 border-b bg-white">
            {selectedConversation ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedConversation.participants.filter(p => p !== 'OfinaPulse' && p !== 'Instagram User')[0]?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {selectedConversation.participants.filter(p => p !== 'OfinaPulse' && p !== 'Instagram User')[0] || 'Instagram User'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {selectedConversation.messages.length} messages
                    </span>
                    {selectedConversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {selectedConversation.unreadCount} unread
                      </Badge>
                    )}
                    {selectedConversation.lastMessage?.replied_by === 'AI' && (
                      <Badge variant="secondary" className="text-xs">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Active
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            ) : (
              <div>
                <CardTitle className="text-lg">Select a Thread</CardTitle>
                <CardDescription>Choose a conversation thread to view messages</CardDescription>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {selectedConversation ? (
              <div className="flex flex-col h-full min-h-[400px] max-h-[70vh]">
                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 min-h-0">
                  {selectedConversation.messages.map((message, index) => {
                    const isFromBusinessAccount = InstagramMessageService.isFromBusinessAccount(message.sender_id);
                    const showSenderName = index === 0 || 
                      selectedConversation.messages[index - 1]?.sender_id !== message.sender_id;
                    const isLastInGroup = index === selectedConversation.messages.length - 1 || 
                      selectedConversation.messages[index + 1]?.sender_id !== message.sender_id;
                    
                    return (
                      <div key={message.message_id} className={`flex ${isFromBusinessAccount ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] sm:max-w-[80%] ${isFromBusinessAccount ? 'order-2' : 'order-1'}`}>
                          {/* Sender name (only show if first in group and not from business account) */}
                          {showSenderName && !isFromBusinessAccount && (
                            <div className="text-xs text-muted-foreground mb-1 px-3">
                              {message.sender_name}
                            </div>
                          )}
                          
                          {/* Message bubble */}
                          <div
                            className={`px-3 sm:px-4 py-2 rounded-2xl max-w-full break-words ${
                              isFromBusinessAccount
                                ? 'bg-purple-500 text-white shadow-sm'
                                : 'bg-muted text-foreground border border-border shadow-sm'
                            } ${
                              showSenderName && !isLastInGroup 
                                ? (isFromBusinessAccount ? 'rounded-tr-md' : 'rounded-tl-md')
                                : ''
                            } ${
                              !showSenderName && !isLastInGroup 
                                ? (isFromBusinessAccount ? 'rounded-tr-md rounded-br-md' : 'rounded-tl-md rounded-bl-md')
                                : ''
                            } ${
                              !showSenderName && isLastInGroup 
                                ? (isFromBusinessAccount ? 'rounded-br-md' : 'rounded-bl-md')
                                : ''
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.message_text}</p>
                            
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment: any, attachIndex: number) => (
                                  <div key={attachIndex} className={`text-xs ${isFromBusinessAccount ? 'text-purple-100' : 'text-gray-600'}`}>
                                    📎 {attachment.type || 'attachment'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Message metadata (only show for last in group) */}
                          {isLastInGroup && (
                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                              isFromBusinessAccount ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{formatTime(message.timestamp)}</span>
                              {isFromBusinessAccount && (
                                <div className="flex items-center gap-1">
                                  {message.is_replied && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                  {message.replied_by === 'AI' && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">AI</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input - Always Visible */}
                <div className="flex-shrink-0 border-t bg-white p-3 sm:p-4">
                  <div className="flex items-end gap-2 sm:gap-3">
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="w-full p-3 border rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 max-h-32 text-sm"
                        rows={1}
                        style={{
                          minHeight: '44px',
                          height: Math.min(Math.max(44, (replyText.split('\n').length) * 20 + 24), 128) + 'px'
                        }}
                      />
                    </div>
                    <Button 
                      onClick={handleSendReply} 
                      disabled={!replyText.trim() || sendingReply}
                      size="sm"
                      className="rounded-xl px-3 sm:px-4 py-2 h-11 flex-shrink-0"
                    >
                      {sendingReply ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                    <span className="text-xs text-gray-500">
                      Press Enter to send, Shift+Enter for new line
                    </span>
                    {selectedConversation.unreadCount > 0 && (
                      <Button
                        onClick={() => markConversationAsRead(selectedConversation.conversationId)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 min-h-[300px]">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No Thread Selected</h3>
                  <p className="text-sm">Choose a conversation thread from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
