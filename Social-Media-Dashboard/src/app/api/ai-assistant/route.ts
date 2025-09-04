import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface DatabaseQueryResult {
  appointments?: any[]
  tasks?: any[]
  facebook_messages?: any[]
  instagram_messages?: any[]
  users?: any[]
}

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an intelligent AI assistant for OfinaPulse, a dental practice management platform. You help dental office staff manage their practice efficiently.

You have access to the following database information:
- Appointments: Patient appointments with status, services, contact info
- Tasks: Office tasks with priorities and due dates  
- Facebook Messages: Patient communications from Facebook
- Instagram Messages: Patient communications from Instagram
- Users: Staff and user accounts

Your capabilities:
1. Query and analyze data from all database tables
2. Provide insights and recommendations for practice improvement
3. Help with appointment scheduling and patient management
4. Analyze communication patterns and response times
5. Identify urgent tasks and overdue items
6. Generate reports and analytics
7. Suggest workflow improvements

Always respond in a helpful, professional tone appropriate for healthcare staff. Provide actionable insights and specific recommendations when possible. Format your responses clearly with relevant data when available.

When analyzing data, focus on:
- Patient satisfaction and communication
- Appointment scheduling efficiency  
- Task completion rates
- Staff productivity
- Practice growth opportunities
- Operational improvements`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Query relevant database information based on the message content
    const dbData = await queryRelevantData(message)
    
    // Create context from database data
    const dataContext = createDataContext(dbData)
    
    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user", 
          content: `User Query: ${message}\n\nCurrent Database Context:\n${dataContext}\n\nPlease provide a helpful response based on the available data.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at the moment."
    
    // Generate insights and recommendations
    const insights = generateInsights(dbData, message)
    const recommendations = generateRecommendations(dbData, message)

    return NextResponse.json({
      response: aiResponse,
      data: dbData,
      insights,
      recommendations
    })

  } catch (error) {
    console.error('Error in AI assistant:', error)
    
    // Provide fallback response if OpenAI fails
    const fallbackResponse = await generateFallbackResponse(request)
    
    return NextResponse.json({
      response: fallbackResponse,
      error: 'AI processing temporarily unavailable, showing cached data'
    })
  }
}

async function queryRelevantData(message: string): Promise<DatabaseQueryResult> {
  const result: DatabaseQueryResult = {}
  
  try {
    // Determine what data to fetch based on message content
    const messageLower = message.toLowerCase()
    
    // Always get recent data for context
    if (messageLower.includes('appointment') || messageLower.includes('schedule') || messageLower.includes('today')) {
      const appointmentsQuery = await db.query(`
        SELECT * FROM appointments 
        ORDER BY created_at DESC 
        LIMIT 20
      `)
      result.appointments = appointmentsQuery.rows
    }
    
    if (messageLower.includes('task') || messageLower.includes('urgent') || messageLower.includes('due')) {
      const tasksQuery = await db.query(`
        SELECT * FROM tasks 
        ORDER BY created_at DESC 
        LIMIT 20
      `)
      result.tasks = tasksQuery.rows
    }
    
    if (messageLower.includes('message') || messageLower.includes('facebook') || messageLower.includes('communication')) {
      const fbQuery = await db.query(`
        SELECT * FROM facebook_messages 
        ORDER BY timestamp DESC 
        LIMIT 15
      `)
      result.facebook_messages = fbQuery.rows
    }
    
    if (messageLower.includes('instagram') || messageLower.includes('social') || messageLower.includes('message')) {
      const igQuery = await db.query(`
        SELECT * FROM instagram_messages 
        ORDER BY timestamp DESC 
        LIMIT 15
      `)
      result.instagram_messages = igQuery.rows
    }
    
    // For analytics or broad queries, get summary data
    if (messageLower.includes('analytic') || messageLower.includes('insight') || messageLower.includes('overview') || messageLower.includes('performance')) {
      result.appointments = (await db.query('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 50')).rows
      result.tasks = (await db.query('SELECT * FROM tasks ORDER BY created_at DESC LIMIT 30')).rows
      result.facebook_messages = (await db.query('SELECT * FROM facebook_messages ORDER BY timestamp DESC LIMIT 25')).rows
      result.instagram_messages = (await db.query('SELECT * FROM instagram_messages ORDER BY timestamp DESC LIMIT 25')).rows
    }

  } catch (error) {
    console.error('Error querying database:', error)
  }
  
  return result
}

function createDataContext(data: DatabaseQueryResult): string {
  let context = "Current Practice Data Summary:\n\n"
  
  if (data.appointments?.length) {
    context += `Appointments (${data.appointments.length} recent):\n`
    context += `- Pending: ${data.appointments.filter(a => a.status === 'Pending').length}\n`
    context += `- Confirmed: ${data.appointments.filter(a => a.status === 'Confirmed').length}\n`
    context += `- Services: ${[...new Set(data.appointments.map(a => a.service))].join(', ')}\n\n`
  }
  
  if (data.tasks?.length) {
    context += `Tasks (${data.tasks.length} recent):\n`
    context += `- Pending: ${data.tasks.filter(t => t.status === 'pending').length}\n`
    context += `- Completed: ${data.tasks.filter(t => t.status === 'completed').length}\n\n`
  }
  
  if (data.facebook_messages?.length) {
    context += `Facebook Messages (${data.facebook_messages.length} recent):\n`
    context += `- Unreplied: ${data.facebook_messages.filter(m => !m.is_replied).length}\n`
    context += `- Recent conversations: ${[...new Set(data.facebook_messages.map(m => m.sender_name))].slice(0, 5).join(', ')}\n\n`
  }
  
  if (data.instagram_messages?.length) {
    context += `Instagram Messages (${data.instagram_messages.length} recent):\n`
    context += `- Unreplied: ${data.instagram_messages.filter(m => !m.is_replied).length}\n\n`
  }
  
  return context
}

function generateInsights(data: DatabaseQueryResult, query: string): string[] {
  const insights: string[] = []
  
  if (data.appointments?.length) {
    const pendingCount = data.appointments.filter(a => a.status === 'Pending').length
    if (pendingCount > 0) {
      insights.push(`${pendingCount} appointments need confirmation`)
    }
    
    const services = [...new Set(data.appointments.map(a => a.service))]
    if (services.length > 3) {
      insights.push(`Offering ${services.length} different services`)
    }
  }
  
  if (data.tasks?.length) {
    const pendingTasks = data.tasks.filter(t => t.status === 'pending').length
    if (pendingTasks > 5) {
      insights.push(`${pendingTasks} pending tasks - consider prioritizing`)
    }
  }
  
  if (data.facebook_messages?.length || data.instagram_messages?.length) {
    const totalUnreplied = (data.facebook_messages?.filter(m => !m.is_replied).length || 0) + 
                          (data.instagram_messages?.filter(m => !m.is_replied).length || 0)
    if (totalUnreplied > 0) {
      insights.push(`${totalUnreplied} unreplied messages need attention`)
    }
  }
  
  return insights
}

function generateRecommendations(data: DatabaseQueryResult, query: string): string[] {
  const recommendations: string[] = []
  
  if (data.appointments?.length) {
    const pendingCount = data.appointments.filter(a => a.status === 'Pending').length
    if (pendingCount >= 3) {
      recommendations.push("Consider calling pending appointments to confirm and reduce no-shows")
    }
  }
  
  if (data.tasks?.length) {
    const pendingTasks = data.tasks.filter(t => t.status === 'pending')
    if (pendingTasks.length >= 5) {
      recommendations.push("Review and prioritize pending tasks - consider delegating some items")
    }
  }
  
  const totalUnreplied = (data.facebook_messages?.filter(m => !m.is_replied).length || 0) + 
                        (data.instagram_messages?.filter(m => !m.is_replied).length || 0)
  if (totalUnreplied >= 3) {
    recommendations.push("Set up automated responses for common patient inquiries to improve response time")
  }
  
  return recommendations
}

async function generateFallbackResponse(request: NextRequest): Promise<string> {
  try {
    const { message } = await request.json()
    const messageLower = message.toLowerCase()
    
    // Provide contextual fallback responses
    if (messageLower.includes('appointment') || messageLower.includes('schedule')) {
      return "I can help you manage appointments! I can show you today's schedule, pending confirmations, and help with appointment analytics. What specific appointment information do you need?"
    }
    
    if (messageLower.includes('task') || messageLower.includes('urgent')) {
      return "I can help you manage your tasks! I can show you pending items, overdue tasks, and help prioritize your workload. What task information would you like to see?"
    }
    
    if (messageLower.includes('message') || messageLower.includes('social')) {
      return "I can help you manage patient communications! I can show you unreplied messages from Facebook and Instagram, analyze response times, and suggest improvements. What would you like to know about your messages?"
    }
    
    return "I'm your practice management AI assistant! I can help you with appointments, tasks, patient messages, and practice analytics. What would you like to know about your dental practice today?"
    
  } catch (error) {
    return "I'm here to help with your dental practice management! Ask me about appointments, tasks, patient messages, or practice analytics."
  }
}