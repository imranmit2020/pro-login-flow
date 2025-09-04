"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight, MapPin, Calendar, RefreshCw, Activity } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";

// Helper function to format time from appointment data
const formatTime = (preferredTime?: string) => {
  if (preferredTime) {
    // If preferred time contains a specific time, return it
    if (preferredTime.match(/\d{1,2}:\d{2}/) || preferredTime.match(/\d{1,2}\s*(AM|PM)/i)) {
      return preferredTime;
    }
    // If it's descriptive (Morning, Evening, etc.), return as is
    return preferredTime;
  }
  
  // Default time if no preferred time
  return "Not specified";
};



// Helper function to parse date from preferred_time
const parseDateFromPreferredTime = (preferredTime?: string) => {
  if (!preferredTime) return null;
  
  // Try to extract date patterns from preferred time
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/,  // MM/DD/YYYY or M/D/YYYY
    /(\d{4}-\d{1,2}-\d{1,2})/,    // YYYY-MM-DD
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i
  ];
  
  for (const pattern of datePatterns) {
    const match = preferredTime.match(pattern);
    if (match) {
      const parsedDate = new Date(match[0]);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }
  
  return null;
};

// Helper function to check if appointment is for today based on preferred_time
const isAppointmentToday = (preferredTime?: string) => {
  const appointmentDate = parseDateFromPreferredTime(preferredTime);
  if (!appointmentDate) return false; // If no date in preferred_time, don't show in today filter
  
  const today = new Date();
  return appointmentDate.getDate() === today.getDate() &&
         appointmentDate.getMonth() === today.getMonth() &&
         appointmentDate.getFullYear() === today.getFullYear();
};

// Helper function to check if appointment is for selected date based on preferred_time
const isAppointmentForDate = (preferredTime: string | undefined, selectedDate: Date) => {
  const appointmentDate = parseDateFromPreferredTime(preferredTime);
  if (!appointmentDate) {
    // If no specific date in preferred_time, show for today only
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  }
  
  return appointmentDate.getDate() === selectedDate.getDate() &&
         appointmentDate.getMonth() === selectedDate.getMonth() &&
         appointmentDate.getFullYear() === selectedDate.getFullYear();
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "border-l-green-500 bg-green-50";
    case "pending":
      return "border-l-yellow-500 bg-yellow-50";
    case "cancelled":
      return "border-l-red-500 bg-red-50";
    default:
      return "border-l-gray-500 bg-gray-50";
  }
};

export function CalendarSection() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { appointmentData, loading, error, fetchAppointmentData } = useAppointments();

  // Filter appointments for the selected date based on preferred_time
  const selectedDateAppointments = appointmentData?.appointments.filter(appointment => 
    isAppointmentForDate(appointment.preferred_time, selectedDate)
  ) || [];

  // Also get today's appointments for stats when not viewing today
  const todayAppointments = appointmentData?.appointments.filter(appointment => 
    isAppointmentToday(appointment.preferred_time)
  ) || [];

  // Calculate stats for the selected date
  const appointmentStats = {
    total: selectedDateAppointments.length,
    confirmed: selectedDateAppointments.filter(apt => apt.status === "Confirmed").length,
    pending: selectedDateAppointments.filter(apt => apt.status === "Pending").length,
    cancelled: selectedDateAppointments.filter(apt => apt.status === "Cancelled").length,
  };

  // Helper to determine if we're viewing today
  const isViewingToday = selectedDate.toDateString() === new Date().toDateString();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    console.log(`Navigating ${direction}: ${selectedDate.toDateString()} -> ${newDate.toDateString()}`);
    console.log('Current selectedDate:', selectedDate);
    console.log('New date:', newDate);
    setSelectedDate(newDate);
  };

  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigateDate('prev');
      } else if (event.key === 'ArrowRight') {
        navigateDate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate]);

  const handleRefresh = () => {
    fetchAppointmentData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Calendar Management
          </h1>
          <p className="text-gray-600 mt-1">Simple appointment scheduling view</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-green-900">{appointmentStats.confirmed}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{appointmentStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{appointmentStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Previous Day Button - Enhanced with better click area */}
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => navigateDate('prev')}
            className="cursor-pointer w-11 h-11 md:w-12 md:h-12 p-0 touch-manipulation select-none flex items-center justify-center"
            aria-label="Go to previous day"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          
          <h2 className="text-lg md:text-xl font-semibold text-center min-w-[200px] md:min-w-[300px]">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          
          {/* Next Day Button - Enhanced with better click area */}
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => navigateDate('next')}
            className="cursor-pointer w-11 h-11 md:w-12 md:h-12 p-0 touch-manipulation select-none flex items-center justify-center"
            aria-label="Go to next day"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSelectedDate(new Date())}
          className="min-w-[44px] min-h-[44px] touch-manipulation"
        >
          Today
        </Button>
      </div>

      {/* Simplified Appointments List - Only Time, Location, Name */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Appointments {isViewingToday ? 'for Today' : `for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          {selectedDateAppointments.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedDateAppointments.length}
            </Badge>
          )}
        </h3>
        
        {loading && (
          <Card className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading appointments...</p>
          </Card>
        )}

        {error && (
          <Card className="p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>
        )}

        {!loading && !error && selectedDateAppointments.length > 0 && (
          <div className="space-y-3">
            {selectedDateAppointments.map((appointment, index) => (
              <Card key={appointment.id} className={`hover:shadow-md transition-shadow border-l-4 ${getStatusColor(appointment.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Time */}
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {formatTime(appointment.preferred_time)}
                        </span>
                      </div>
                      
                      {/* Service */}
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {appointment.service}
                        </span>
                      </div>
                      
                      {/* Name */}
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">
                          {appointment.full_name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <Badge 
                      variant={appointment.status === 'Confirmed' ? 'default' : 
                              appointment.status === 'Pending' ? 'secondary' : 'destructive'}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && selectedDateAppointments.length === 0 && (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments {isViewingToday ? 'today' : 'for this date'}
            </h3>
            <p className="text-gray-600 mb-4">
              No appointments found for {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}