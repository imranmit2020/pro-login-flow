import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const result = await db.query(`
      SELECT * FROM facebook_messages 
      ORDER BY timestamp DESC 
      LIMIT 50
    `);
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching Facebook messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const message = await request.json()
    
    await db.query(`
      INSERT INTO facebook_messages (
        message_id, conversation_id, sender_id, sender_name, receipt_id,
        message_text, attachments, timestamp, platform, is_replied, replied_by, reply_message_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (message_id) DO UPDATE SET
        message_text = EXCLUDED.message_text,
        attachments = EXCLUDED.attachments,
        is_replied = EXCLUDED.is_replied,
        replied_by = EXCLUDED.replied_by,
        reply_message_id = EXCLUDED.reply_message_id,
        updated_at = NOW()
    `, [
      message.message_id,
      message.conversation_id,
      message.sender_id,
      message.sender_name,
      message.receipt_id,
      message.message_text,
      JSON.stringify(message.attachments),
      message.timestamp,
      message.platform,
      message.is_replied,
      message.replied_by,
      message.reply_message_id
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing Facebook message:', error)
    return NextResponse.json(
      { error: 'Failed to store message' },
      { status: 500 }
    )
  }
}