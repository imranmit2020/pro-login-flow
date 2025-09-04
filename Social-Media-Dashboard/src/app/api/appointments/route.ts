import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    // Get all appointments first
    const appointments = await db.getAppointments();

    // Apply filters
    let filteredAppointments = appointments;
    
    if (status && status !== 'all') {
      filteredAppointments = appointments.filter((apt: any) => apt.status === status);
    }

    if (limit) {
      filteredAppointments = filteredAppointments.slice(0, parseInt(limit));
    }

    // Calculate statistics
    const totalAppointments = appointments?.length || 0;
    const confirmedAppointments = appointments?.filter((apt: any) => apt.status === 'Confirmed').length || 0;
    const pendingAppointments = appointments?.filter((apt: any) => apt.status === 'Pending').length || 0;
    const cancelledAppointments = appointments?.filter((apt: any) => apt.status === 'Cancelled').length || 0;
    
    const confirmationRate = totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0;

    // Group by status for charts
    const appointmentsByStatus = {
      'Confirmed': confirmedAppointments,
      'Pending': pendingAppointments,
      'Cancelled': cancelledAppointments
    };

    // Group by service for analytics
    const appointmentsByService = appointments?.reduce((acc: any, apt: any) => {
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
      appointments: filteredAppointments || [],
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, phone_number, gender, location, service, preferred_time } = body;

    if (!full_name || !phone_number || !service) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appointment = await db.createAppointment({
      full_name,
      phone_number,
      gender,
      location,
      service,
      preferred_time
    });

    return NextResponse.json({ 
      success: true, 
      appointment,
      message: 'Appointment created successfully' 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}