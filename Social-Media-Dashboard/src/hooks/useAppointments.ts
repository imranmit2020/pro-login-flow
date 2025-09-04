import { useState, useEffect, useCallback } from 'react';

interface AppointmentStats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  confirmationRate: number;
  appointmentsByStatus: Record<string, number>;
  appointmentsByService: Record<string, number>;
  appointments: Array<{
    id: string;
    full_name: string;
    phone_number: string;
    age: number;
    location: string;
    service: string;
    preferred_time?: string;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
    created_at: string;
  }>;
  lastUpdated: string;
}

export function useAppointments() {
  const [appointmentData, setAppointmentData] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointment data from API
  const fetchAppointmentData = useCallback(async () => {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch appointment data');
      const data = await response.json();
      setAppointmentData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointment data:', err);
      setError('Failed to load appointment data');
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAppointmentData();
      setLoading(false);
    };
    loadData();
  }, [fetchAppointmentData]);

  // Auto-refresh every 60 seconds to keep counts updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointmentData();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [fetchAppointmentData]);

  // Get pending appointments count
  const pendingAppointmentsCount = appointmentData?.pendingAppointments || 0;

  // Update appointment status
  const updateAppointmentStatus = useCallback(async (id: string, status: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) throw new Error('Failed to update appointment');
      
      // Refresh data after update
      await fetchAppointmentData();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment');
      throw err;
    }
  }, [fetchAppointmentData]);

  return {
    appointmentData,
    loading,
    error,
    pendingAppointmentsCount,
    fetchAppointmentData,
    updateAppointmentStatus,
  };
} 