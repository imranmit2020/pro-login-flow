import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM tasks ORDER BY created_at DESC'
      );

      const tasks = result.rows;
      return NextResponse.json({ tasks });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from_email, task_name, task_purpose, due_date, status = 'pending' } = body;

    if (!from_email || !task_name || !task_purpose) {
      return NextResponse.json(
        { error: 'Missing required fields: from_email, task_name, task_purpose' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO tasks (from_email, task_name, task_purpose, due_date, status, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW()) 
        RETURNING *
      `;
      
      const values = [from_email, task_name, task_purpose, due_date || null, status];
      const result = await client.query(query, values);

      const task = result.rows[0];
      return NextResponse.json({ task });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    if (!['pending', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "pending" or "completed"' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = 'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *';
      const values = [status, id];
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      const task = result.rows[0];
      return NextResponse.json({ task });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}