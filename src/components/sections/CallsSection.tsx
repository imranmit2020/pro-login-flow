"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  PhoneCall,
  Clock,
  TrendingUp,
  Play,
  Download,
  User
} from "lucide-react";

export function CallsSection() {
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    activeCalls: 0,
    averageDuration: 0
  });

  const [recentCalls, setRecentCalls] = useState([
    {
      id: 1,
      caller: "+1 (555) 123-4567",
      duration: "5:23",
      status: "Completed",
      time: "10:30 AM",
      type: "Incoming"
    },
    {
      id: 2,
      caller: "+1 (555) 987-6543",
      duration: "2:15",
      status: "Missed",
      time: "9:45 AM", 
      type: "Incoming"
    },
    {
      id: 3,
      caller: "+1 (555) 456-7890",
      duration: "8:42",
      status: "Completed",
      time: "9:20 AM",
      type: "Outgoing"
    }
  ]);

  useEffect(() => {
    // Fetch call statistics
    const fetchCallStats = async () => {
      try {
        const response = await fetch('/api/elevenlabs/calls');
        if (response.ok) {
          const data = await response.json();
          setCallStats({
            totalCalls: data.totalCalls || 0,
            successfulCalls: data.successfulCalls || 0,
            activeCalls: 0, // Will be fetched from active calls endpoint
            averageDuration: data.averageDurationMinutes || 0
          });
        }
      } catch (error) {
        console.error('Error fetching call stats:', error);
      }
    };

    fetchCallStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "Missed":
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      case "Active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Management</h1>
          <p className="text-gray-600">Monitor and manage your AI-powered calls</p>
        </div>
        <Button>
          <PhoneCall className="h-4 w-4 mr-2" />
          New Call
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.totalCalls}</p>
              </div>
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.successfulCalls}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.activeCalls}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Live</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{callStats.averageDuration.toFixed(1)}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{call.caller}</p>
                    <p className="text-sm text-gray-500">{call.time} • {call.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{call.duration}</p>
                    {getStatusBadge(call.status)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}