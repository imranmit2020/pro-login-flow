"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Download,
  MoreHorizontal,
  Users,
  CalendarDays,
  Activity,
  TrendingUp,
  MessageSquare,
  Volume2,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CallTranscriptModal } from "@/components/CallTranscriptModal";
import { RecordingData, ElevenLabsUsageData, ActiveCallsData } from "@/types/elevenlabs";

// Types for appointments
interface Appointment {
  id: string;
  full_name: string;
  phone_number: string;
  location: string;
  service: string;
  preferred_time?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  created_at: string;
}

interface AppointmentStats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  confirmationRate: number;
  appointmentsByStatus: Record<string, number>;
  appointmentsByService: Record<string, number>;
  appointments: Appointment[];
  lastUpdated: string;
}

export function CallsSection() {
  const [appointmentData, setAppointmentData] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // ElevenLabs call data
  const [callRecordings, setCallRecordings] = useState<RecordingData[]>([]);
  const [callUsage, setCallUsage] = useState<ElevenLabsUsageData['data'] | null>(null);
  const [activeCalls, setActiveCalls] = useState<ActiveCallsData['data'] | null>(null);
  const [callLoading, setCallLoading] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAllRecordings, setShowAllRecordings] = useState(false);
  const [phoneSearchTerm, setPhoneSearchTerm] = useState('');
  const [debugData, setDebugData] = useState<any>(null);

  const itemsPerPage = 10;

  // Fetch appointment data from API
  const fetchAppointmentData = async () => {
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
  };

  // Fetch ElevenLabs call data
  const fetchCallData = async () => {
    setCallLoading(true);
    try {
      // Fetch call recordings for selected date
      const recordingsResponse = await fetch(`/api/elevenlabs/getRecordings?date=${selectedDate}`);
      if (recordingsResponse.ok) {
        const recordingsData = await recordingsResponse.json();
        if (recordingsData.success) {
          console.log('Call recordings data received:', recordingsData.data);
          setCallRecordings(recordingsData.data || []);
        }
      }

      // Fetch call usage
      const usageResponse = await fetch('/api/elevenlabs/usage');
      if (usageResponse.ok) {
        const usageData: ElevenLabsUsageData = await usageResponse.json();
        if (usageData.success) {
          setCallUsage(usageData.data || null);
        }
      }

      // Fetch active calls
      const activeResponse = await fetch('/api/elevenlabs/getActiveCalls');
      if (activeResponse.ok) {
        const activeData: ActiveCallsData = await activeResponse.json();
        if (activeData.success) {
          setActiveCalls(activeData.data || null);
        }
      }

      setCallError(null);
    } catch (err) {
      console.error('Error fetching call data:', err);
      setCallError('Failed to load call data');
    } finally {
      setCallLoading(false);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (id: string, status: string) => {
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
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAppointmentData(), fetchCallData()]);
      setLoading(false);
    };
    loadData();
  }, [selectedDate]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        Promise.all([fetchAppointmentData(), fetchCallData()]);
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchAppointmentData(), fetchCallData()]);
    setLoading(false);
  };

  // Debug function to check API structure
  const handleDebug = async () => {
    try {
      const response = await fetch('/api/elevenlabs/debug');
      if (response.ok) {
        const data = await response.json();
        console.log('Debug data:', data);
        setDebugData(data);
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  // Test function to see raw API response
  const handleTest = async () => {
    try {
      const response = await fetch('/api/elevenlabs/test');
      if (response.ok) {
        const data = await response.json();
        console.log('Test data:', data);
        setDebugData(data);
      }
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  // Export appointment logs
  const exportAppointmentLogs = () => {
    if (!appointmentData) return;
    
    const csvData = appointmentData.appointments.map(appointment => ({
      id: appointment.id,
      name: appointment.full_name,
      phone: appointment.phone_number,
      location: appointment.location,
      service: appointment.service,
      preferred_time: appointment.preferred_time || 'Not specified',
      status: appointment.status,
      created_at: new Date(appointment.created_at).toLocaleString(),
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and search appointments
  const filteredAppointments = appointmentData?.appointments.filter(appointment => {
    const matchesFilter = selectedFilter === 'all' || appointment.status === selectedFilter;
    
    const matchesSearch = searchTerm === '' || 
      appointment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phone_number.includes(searchTerm) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Pending':
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case 'Pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  // Helper functions for call data
  const formatCallDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return 'No phone number';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else {
      return phone; // Return original if can't format
    }
  };

  const formatCallDateTime = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleString();
  };

  const handleViewTranscript = (conversationId: string) => {
    setSelectedCallId(conversationId);
    setShowTranscriptModal(true);
  };

  const closeTranscriptModal = () => {
    setShowTranscriptModal(false);
    setSelectedCallId(null);
  };

  // Date navigation functions
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Filter recordings by phone number
  const filteredRecordings = callRecordings.filter(recording => {
    if (!phoneSearchTerm) return true;
    return recording.user_phone && recording.user_phone.includes(phoneSearchTerm);
  });



  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Appointment Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Appointments Management
          </h1>
          <p className="text-gray-600 mt-1">Manage patient appointments and track booking statistics</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-300' : ''}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportAppointmentLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Appointments</p>
                <p className="text-2xl font-bold text-blue-900">{appointmentData?.totalAppointments || 0}</p>
                <p className="text-xs text-blue-600">
                  All time bookings
                </p>
              </div>
              <CalendarDays className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-900">{appointmentData?.confirmedAppointments || 0}</p>
                <p className="text-xs text-green-600">
                  {appointmentData?.confirmationRate.toFixed(1) || 0}% confirmation rate
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{appointmentData?.pendingAppointments || 0}</p>
                <p className="text-xs text-yellow-600">
                  Awaiting confirmation
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{appointmentData?.cancelledAppointments || 0}</p>
                <p className="text-xs text-red-600">
                  Cancelled bookings
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Appointment Logs & Management
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All ({appointmentData?.appointments.length || 0})
              </Button>
              <Button
                variant={selectedFilter === 'Pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('Pending')}
              >
                Pending ({appointmentData?.pendingAppointments || 0})
              </Button>
              <Button
                variant={selectedFilter === 'Confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('Confirmed')}
              >
                Confirmed ({appointmentData?.confirmedAppointments || 0})
              </Button>
              <Button
                variant={selectedFilter === 'Cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('Cancelled')}
              >
                Cancelled ({appointmentData?.cancelledAppointments || 0})
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              paginatedAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1 rounded-full bg-gray-100">
                          {getStatusIcon(appointment.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.full_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.created_at).toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.phone_number}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{appointment.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span>{appointment.service}</span>
                        </div>
                      </div>
                      
                      {appointment.preferred_time && (
                        <div className="bg-gray-50 rounded-md p-3 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Preferred Time:</span>
                            <span>{appointment.preferred_time}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col gap-2">
                      {appointment.status === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateAppointmentStatus(appointment.id, 'Confirmed')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => updateAppointmentStatus(appointment.id, 'Cancelled')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === 'Confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => updateAppointmentStatus(appointment.id, 'Cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      {appointment.status === 'Cancelled' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateAppointmentStatus(appointment.id, 'Confirmed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Reconfirm
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Analytics */}
      {appointmentData && Object.keys(appointmentData.appointmentsByService).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Service Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(appointmentData.appointmentsByService).map(([service, count]) => (
                <div key={service} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{service}</p>
                      <p className="text-sm text-gray-600">{count} appointments</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${appointmentData.totalAppointments > 0 ? (count / appointmentData.totalAppointments) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Call Analytics & Recordings
          </CardTitle>
          <CardDescription>
            ElevenLabs call recordings, transcripts, and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Call Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">            
      
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Active Calls</p>
                    <p className="text-2xl font-bold text-green-900">{activeCalls?.active_calls || 0}</p>
                    <p className="text-xs text-green-600">Currently in progress</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Recordings</p>
                    <p className="text-2xl font-bold text-orange-900">{callRecordings.length}</p>
                    <p className="text-xs text-orange-600">Available transcripts</p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call Recordings List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Call Recordings</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousDay}
                    disabled={callLoading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={goToToday}
                    disabled={callLoading}
                    className="min-w-[140px]"
                  >
                    {formatDisplayDate(selectedDate)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextDay}
                    disabled={callLoading}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={callLoading}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by phone number..."
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    value={phoneSearchTerm}
                    onChange={(e) => setPhoneSearchTerm(e.target.value)}
                    disabled={callLoading}
                  />
                  {phoneSearchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPhoneSearchTerm('')}
                      className="h-8 w-8 p-0"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {callLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>
            
            {/* Date Summary */}
            {callRecordings.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 font-medium">
                    {filteredRecordings.length} of {callRecordings.length} recording{callRecordings.length !== 1 ? 's' : ''} found for {formatDisplayDate(selectedDate)}
                    {phoneSearchTerm && ` (filtered by phone: ${phoneSearchTerm})`}
                  </span>
                  <span className="text-blue-600">
                    Total duration: {formatCallDuration(filteredRecordings.reduce((total, recording) => total + recording.call_duration_secs, 0))}
                  </span>
                </div>
              </div>
            )}
            
            {callError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{callError}</p>
              </div>
            )}

            {filteredRecordings.length === 0 && !callLoading ? (
              <div className="text-center py-12">
                <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {callRecordings.length === 0 
                    ? `No call recordings found for ${formatDisplayDate(selectedDate)}`
                    : `No recordings match phone number "${phoneSearchTerm}"`
                  }
                </h3>
                <p className="text-gray-600">
                  {callRecordings.length === 0 
                    ? "Try selecting a different date or check back later."
                    : "Try adjusting your search term or clear the filter."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(showAllRecordings ? filteredRecordings : filteredRecordings.slice(0, 10)).map((recording) => (
                  <div key={recording.conversation_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-1 rounded-full bg-purple-100">
                            <Volume2 className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {recording.agent_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatCallDateTime(recording.start_time_unix_secs)}
                            </p>
                          </div>
                          <Badge variant={recording.status === 'completed' ? 'default' : 'secondary'}>
                            {recording.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Duration: {formatCallDuration(recording.call_duration_secs)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">{formatPhoneNumber(recording.user_phone)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>ID: {recording.conversation_id.slice(-8)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Agent: {recording.agent_name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewTranscript(recording.conversation_id)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Transcript
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredRecordings.length > 10 && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllRecordings(!showAllRecordings)}
                >
                  {showAllRecordings ? 'Show Less' : `View All Recordings (${filteredRecordings.length})`}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Data Display */}
      {debugData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Debug API Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Transcript Modal */}
      {selectedCallId && (
        <CallTranscriptModal
          isOpen={showTranscriptModal}
          onClose={closeTranscriptModal}
          conversationId={selectedCallId}
        />
      )}
    </div>
  );
}