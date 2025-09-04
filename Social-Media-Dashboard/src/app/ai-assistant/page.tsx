'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Send, 
  MessageCircle, 
  Users, 
  Calendar, 
  CheckSquare, 
  Mail,
  TrendingUp,
  Clock,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Brain
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  data?: any
  insights?: string[]
  recommendations?: string[]
}

interface QuickAction {
  label: string
  icon: React.ReactNode
  query: string
  color: string
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hello! I'm your OfinaPulse AI Assistant. I can help you with anything related to your dental practice - from checking appointments and patient messages to analyzing practice trends and managing tasks. What would you like to know?",
      timestamp: new Date(),
      insights: [
        "I can query all your database information instantly",
        "Ask me about appointments, messages, tasks, or analytics",
        "I provide intelligent insights and recommendations"
      ]
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions: QuickAction[] = [
    {
      label: "Today's Schedule",
      icon: <Calendar className="w-4 h-4" />,
      query: "Show me today's appointments and schedule overview",
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
    },
    {
      label: "Urgent Tasks",
      icon: <AlertCircle className="w-4 h-4" />,
      query: "What are my urgent tasks and overdue items?",
      color: "bg-red-50 text-red-700 hover:bg-red-100"
    },
    {
      label: "New Messages",
      icon: <MessageCircle className="w-4 h-4" />,
      query: "Show me recent patient messages from Facebook and Instagram",
      color: "bg-green-50 text-green-700 hover:bg-green-100"
    },
    {
      label: "Practice Insights",
      icon: <TrendingUp className="w-4 h-4" />,
      query: "Give me insights about my practice performance and trends",
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100"
    },
    {
      label: "Patient Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      query: "Analyze patient data and show me key metrics",
      color: "bg-orange-50 text-orange-700 hover:bg-orange-100"
    },
    {
      label: "Recommendations",
      icon: <Lightbulb className="w-4 h-4" />,
      query: "What recommendations do you have to improve my practice?",
      color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (query?: string) => {
    const messageText = query || inputValue.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      // Simulate typing delay for better UX
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          data: data.data,
          insights: data.insights,
          recommendations: data.recommendations
        }

        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
        setIsLoading(false)
      }, 1500)

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I encountered an error while processing your request. Please try again or ask a different question.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const handleQuickAction = (query: string) => {
    handleSendMessage(query)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-600">Intelligent practice management support</p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI Online
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`${action.color} border-none font-medium`}
              onClick={() => handleQuickAction(action.query)}
              disabled={isLoading}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}>
                {message.type === 'user' ? (
                  <Users className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col gap-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <Card className={`${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    
                    {/* Data Visualization */}
                    {message.data && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <pre className="text-xs text-gray-700 overflow-auto">
                          {JSON.stringify(message.data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Insights */}
                    {message.insights && message.insights.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Insights
                        </h4>
                        <div className="space-y-1">
                          {message.insights.map((insight, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Recommendations
                        </h4>
                        <div className="space-y-1">
                          {message.recommendations.map((rec, index) => (
                            <div key={index} className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <span className="text-xs text-gray-500">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your practice... (e.g., 'Show me today's appointments' or 'What tasks need attention?')"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="text-sm"
            />
          </div>
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}