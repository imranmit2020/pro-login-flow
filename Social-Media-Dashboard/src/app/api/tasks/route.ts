import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error) {
    console.error('Error in tasks API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const taskData: any = { from_email, task_name, task_purpose, status };
    if (due_date) {
      taskData.due_date = due_date;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error in tasks POST API:', error);
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

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error in tasks PUT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 