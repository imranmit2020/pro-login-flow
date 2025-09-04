import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalAppointments = appointments?.length || 0;
    const confirmedAppointments = appointments?.filter(apt => apt.status === 'Confirmed').length || 0;
    const pendingAppointments = appointments?.filter(apt => apt.status === 'Pending').length || 0;
    const cancelledAppointments = appointments?.filter(apt => apt.status === 'Cancelled').length || 0;
    
    const confirmationRate = totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0;

    // Group by status for charts
    const appointmentsByStatus = {
      'Confirmed': confirmedAppointments,
      'Pending': pendingAppointments,
      'Cancelled': cancelledAppointments
    };

    // Group by service for analytics
    const appointmentsByService = appointments?.reduce((acc, apt) => {
      acc[apt.service] = (acc[apt.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const stats = {
      totalAppointments,
      confirmedAppointments,
      pendingAppointments,
      cancelledAppointments,
      confirmationRate,
      appointmentsByStatus,
      appointmentsByService,
      appointments: appointments || [],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in appointments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, appointment: data });
  } catch (error) {
    console.error('Error in appointments PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 