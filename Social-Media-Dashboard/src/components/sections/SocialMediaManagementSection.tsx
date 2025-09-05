"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  Send, 
  Calendar, 
  Image, 
  Sparkles,
  BarChart3,
  Layout,
  Facebook,
  Instagram,
  Linkedin,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Settings,
  Users,
  Clock,
  Activity,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  EyeOff,
  Zap,
  Target,
  Mail,
  Phone,
  Globe,
  Wand2,
  Megaphone,
  TrendingUp as TrendingUpIcon,
  DollarSign,
  BarChart,
  Loader2
} from "lucide-react";
import { useSocialPages } from "@/hooks/useSocialPages";

interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

interface AddPageFormData {
  platform: 'facebook' | 'instagram' | '';
  pageName: string;
  pageId: string;
  accessToken: string;
  appId: string;
  appSecret: string;
}

// Helper components for form inputs
const Input = ({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  );
};

export function SocialMediaManagementSection() {
  const [activeTab, setActiveTab] = useState("composer");
  const [posts] = useState<Post[]>([]);
  
  // AI Broadcasting state
  const [broadcastContent, setBroadcastContent] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [audienceSize, setAudienceSize] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignType, setCampaignType] = useState('sales');
  const [businessInfo, setBusinessInfo] = useState('');
  
  // Social Pages functionality
  const { pages, loading, error, refetch } = useSocialPages();
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({
    accessToken: false,
    appSecret: false
  });
  const [formData, setFormData] = useState<AddPageFormData>({
    platform: '',
    pageName: '',
    pageId: '',
    accessToken: '',
    appId: '',
    appSecret: ''
  });

  const connectedPages = pages.filter(page => page.isConnected);
  const totalMessages = connectedPages.reduce((sum, page) => sum + page.stats.totalMessages, 0);

  const handleAddPage = () => {
    setShowAddPageDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddPageDialog(false);
    setFormData({
      platform: '',
      pageName: '',
      pageId: '',
      accessToken: '',
      appId: '',
      appSecret: ''
    });
    setShowPassword({
      accessToken: false,
      appSecret: false
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleCloseDialog();
    console.log('Adding new page:', formData);
    setTimeout(() => {
      refetch();
    }, 1000);
  };

  const handleInputChange = (field: keyof AddPageFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'accessToken' | 'appSecret') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // AI Broadcasting handlers
  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignType,
          businessInfo,
          channels: selectedChannels
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setBroadcastContent(data.content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastContent || selectedChannels.length === 0) return;
    
    try {
      const response = await fetch('/api/broadcast/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: broadcastContent,
          channels: selectedChannels,
          campaignType
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Show success message and reset form
        setBroadcastContent('');
        setSelectedChannels([]);
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
    }
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-violet-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Social Media Management
            </h1>
            <p className="text-gray-600">
              Create, schedule, and manage your business's social media presence across all platforms.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Multi-Platform
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "composer", label: "Post Composer", icon: Plus },
            { id: "broadcast", label: "AI Broadcasting", icon: Zap },
            { id: "pages", label: "Pages & Accounts", icon: Settings },
            { id: "calendar", label: "Content Calendar", icon: Calendar },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "templates", label: "Templates", icon: Layout }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === "composer" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Post Composer */}
            <Card className="border-violet-100">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-violet-600" />
                  Create New Post
                </CardTitle>
                <CardDescription>
                  Craft engaging content for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <textarea
                    placeholder="Share updates about your business, industry insights, or showcase your services..."
                    className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Platforms
                  </label>
                  <div className="flex gap-2">
                    {[
                      { name: "Facebook", icon: Facebook, color: "blue" },
                      { name: "Instagram", icon: Instagram, color: "pink" },
                      { name: "LinkedIn", icon: Linkedin, color: "blue" }
                    ].map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <Button
                          key={platform.name}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {platform.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700">
                    <Send className="w-4 h-4 mr-2" />
                    Post Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="border-indigo-100">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Content Assistant
                </CardTitle>
                <CardDescription>
                  Generate engaging content tailored for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Industry Tips",
                    "Service Showcase",
                    "Customer Testimonial",
                    "Appointment Reminder",
                    "Business Updates",
                    "Team Highlights"
                  ].map((template) => (
                    <Button
                      key={template}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {template}
                    </Button>
                  ))}
                </div>
                
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "broadcast" && (
          <div className="space-y-6">
            {/* Broadcasting Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    AI-Powered Multi-Channel Broadcasting
                  </CardTitle>
                  <CardDescription>
                    Generate engaging content with AI and broadcast across SMS, Email, and Social Media to boost sales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Campaign Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Campaign Type
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { id: 'sales', label: 'Sales Boost', icon: DollarSign, color: 'green' },
                        { id: 'engagement', label: 'Engagement', icon: Heart, color: 'pink' },
                        { id: 'announcement', label: 'Announcement', icon: Megaphone, color: 'blue' },
                        { id: 'promotion', label: 'Promotion', icon: Target, color: 'purple' }
                      ].map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.id}
                            variant={campaignType === type.id ? 'default' : 'outline'}
                            onClick={() => setCampaignType(type.id)}
                            className={`flex flex-col items-center gap-2 h-auto py-4 ${
                              campaignType === type.id ? `bg-${type.color}-600 hover:bg-${type.color}-700` : ''
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{type.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Business Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Information (Help AI understand your business)
                    </label>
                    <textarea
                      value={businessInfo}
                      onChange={(e) => setBusinessInfo(e.target.value)}
                      placeholder="Describe your business, products, services, target audience, and current offers..."
                      className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Channel Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Broadcasting Channels
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                      {[
                        { id: 'sms', label: 'SMS', icon: Phone, color: 'green', description: 'Text Messages' },
                        { id: 'email', label: 'Email', icon: Mail, color: 'blue', description: 'Email Marketing' },
                        { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue', description: 'Facebook Posts' },
                        { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink', description: 'Instagram Posts' },
                        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue', description: 'LinkedIn Posts' }
                      ].map((channel) => {
                        const Icon = channel.icon;
                        const isSelected = selectedChannels.includes(channel.id);
                        return (
                          <Button
                            key={channel.id}
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => toggleChannel(channel.id)}
                            className={`flex flex-col items-center gap-2 h-auto py-4 ${
                              isSelected ? `bg-${channel.color}-600 hover:bg-${channel.color}-700` : ''
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <div className="text-center">
                              <div className="text-xs font-medium">{channel.label}</div>
                              <div className="text-xs opacity-75">{channel.description}</div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Content Generation */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-orange-600" />
                        <span className="font-medium text-orange-900">AI Content Generator</span>
                      </div>
                      <Button
                        onClick={generateAIContent}
                        disabled={isGenerating || !businessInfo || selectedChannels.length === 0}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <textarea
                      value={broadcastContent}
                      onChange={(e) => setBroadcastContent(e.target.value)}
                      placeholder="AI-generated content will appear here, or write your own message..."
                      className="w-full h-32 p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white"
                    />
                  </div>

                  {/* Broadcast Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {selectedChannels.length > 0 ? (
                        <>Broadcasting to <span className="font-medium">{selectedChannels.length}</span> channel{selectedChannels.length !== 1 ? 's' : ''}</>
                      ) : (
                        'Select channels to broadcast'
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button
                        onClick={sendBroadcast}
                        disabled={!broadcastContent || selectedChannels.length === 0}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Broadcast
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Broadcasting Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600">24.5%</div>
                    <div className="text-xs text-muted-foreground">Avg. Response Rate</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-600">1.2K</div>
                    <div className="text-xs text-muted-foreground">Messages Sent</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-600">$890</div>
                    <div className="text-xs text-muted-foreground">Sales Generated</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      <BarChart className="w-4 h-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Track your latest broadcasting campaigns and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, title: 'Holiday Sale Announcement', channels: ['SMS', 'Email', 'Facebook'], sent: '2 hours ago', response: '28%', sales: '$450' },
                    { id: 2, title: 'New Product Launch', channels: ['Instagram', 'LinkedIn', 'Email'], sent: '1 day ago', response: '22%', sales: '$230' },
                    { id: 3, title: 'Customer Appreciation', channels: ['SMS', 'Facebook'], sent: '3 days ago', response: '31%', sales: '$180' }
                  ].map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Channels:</span>
                          <div className="flex gap-1">
                            {campaign.channels.map((channel) => (
                              <Badge key={channel} variant="secondary" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{campaign.sent}</div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm font-medium text-green-600">{campaign.response} response</span>
                          <span className="text-sm font-medium text-blue-600">{campaign.sales} sales</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "pages" && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Connected Pages</CardTitle>
                  <Activity className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">{connectedPages.length}</div>
                  <p className="text-xs text-muted-foreground">of {pages.length} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">{totalMessages}</div>
                  <p className="text-xs text-muted-foreground">across all pages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                  <Clock className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-500">
                    {connectedPages.length > 0 
                      ? Math.round(connectedPages.reduce((sum, page) => sum + page.stats.averageResponseTime, 0) / connectedPages.length)
                      : 0} min
                  </div>
                  <p className="text-xs text-muted-foreground">average time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                  <Users className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-500">
                    {connectedPages.reduce((sum, page) => sum + page.stats.followers, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">across all pages</p>
                </CardContent>
              </Card>
            </div>

            {/* Pages Management */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Your Social Media Pages</h2>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={refetch}
                    variant="outline" 
                    size="sm"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {pages.length} page{pages.length !== 1 ? 's' : ''} total
                  </div>
                </div>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-violet-500 mb-4" />
                  <p className="text-muted-foreground">Loading your social media pages...</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                    <p className="text-red-600 mb-2">Error loading pages: {error}</p>
                    <Button onClick={refetch} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pages.map((page) => (
                    <Card key={page.id} className="group cursor-pointer transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                {page.platform === 'facebook' ? (
                                  <Facebook className="w-6 h-6 text-blue-600" />
                                ) : (
                                  <Instagram className="w-6 h-6 text-pink-600" />
                                )}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                page.isConnected ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-base">{page.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={page.isConnected ? "default" : "secondary"} className="text-xs">
                                  {page.isConnected ? "Connected" : "Disconnected"}
                                </Badge>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {page.platform}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {page.isConnected ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <div className="text-lg font-bold text-blue-500">{page.stats.totalMessages}</div>
                                <div className="text-xs text-muted-foreground">Messages</div>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <div className="text-lg font-bold text-orange-500">{page.stats.unreadMessages}</div>
                                <div className="text-xs text-muted-foreground">Unread</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <div className="text-lg font-bold text-purple-500">{page.stats.averageResponseTime}m</div>
                                <div className="text-xs text-muted-foreground">Avg Response</div>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="text-lg font-bold text-green-500">{page.stats.engagement}%</div>
                                <div className="text-xs text-muted-foreground">Engagement</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {page.stats.followers.toLocaleString()} followers
                                </span>
                              </div>
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>

                            <div className="space-y-2">
                              <Button className="w-full bg-violet-600 hover:bg-violet-700">
                                View Messages
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                              <div className="text-xs text-center text-muted-foreground">
                                Last activity: {page.lastActivity}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-500/10 flex items-center justify-center">
                              <Settings className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Page not connected</p>
                              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                                Connect Page
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add New Page Card */}
                  <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-violet-500" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold">Add New Page</h3>
                        <p className="text-sm text-muted-foreground">Connect another Facebook or Instagram page</p>
                      </div>
                      <Button onClick={handleAddPage} className="bg-violet-600 hover:bg-violet-700">
                        Add Page
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                View and manage your scheduled posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Calendar</h3>
                <p className="text-gray-600">Your content calendar will appear here with scheduled posts.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Reach", value: "0", icon: Eye, color: "blue" },
              { label: "Engagement", value: "0", icon: Heart, color: "red" },
              { label: "Comments", value: "0", icon: MessageCircle, color: "green" },
              { label: "Shares", value: "0", icon: Share, color: "purple" }
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 text-${stat.color}-500`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "templates" && (
          <Card>
            <CardHeader>
              <CardTitle>Content Templates</CardTitle>
              <CardDescription>
                Pre-designed templates for professional business content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Template Library</h3>
                <p className="text-gray-600">Browse and use professional templates for your posts.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Page Dialog */}
      <Dialog open={showAddPageDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Connect Social Media Page</DialogTitle>
            <DialogDescription>
              Follow the steps below to connect your Facebook Page or Instagram Business Account
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <form onSubmit={handleFormSubmit} className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">1. Choose Platform</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.platform === 'facebook' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('platform', 'facebook')}
                    className="flex-1"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    type="button"
                    variant={formData.platform === 'instagram' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('platform', 'instagram')}
                    className="flex-1"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                </div>
              </div>

              {formData.platform && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pageName">2. Page Name</Label>
                    <Input
                      id="pageName"
                      value={formData.pageName}
                      onChange={(e) => handleInputChange('pageName', e.target.value)}
                      placeholder="Enter your page name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pageId">3. Page ID</Label>
                    <Input
                      id="pageId"
                      value={formData.pageId}
                      onChange={(e) => handleInputChange('pageId', e.target.value)}
                      placeholder="Enter your page ID"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appId">4. App ID</Label>
                    <Input
                      id="appId"
                      value={formData.appId}
                      onChange={(e) => handleInputChange('appId', e.target.value)}
                      placeholder="Enter your app ID"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appSecret">5. App Secret</Label>
                    <div className="relative">
                      <Input
                        id="appSecret"
                        type={showPassword.appSecret ? 'text' : 'password'}
                        value={formData.appSecret}
                        onChange={(e) => handleInputChange('appSecret', e.target.value)}
                        placeholder="Enter your app secret"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => togglePasswordVisibility('appSecret')}
                      >
                        {showPassword.appSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessToken">6. Access Token</Label>
                    <div className="relative">
                      <Input
                        id="accessToken"
                        type={showPassword.accessToken ? 'text' : 'password'}
                        value={formData.accessToken}
                        onChange={(e) => handleInputChange('accessToken', e.target.value)}
                        placeholder="Enter your access token"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => togglePasswordVisibility('accessToken')}
                      >
                        {showPassword.accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleFormSubmit} 
              disabled={!formData.platform || !formData.pageName || !formData.pageId || !formData.appId || !formData.appSecret || !formData.accessToken}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Connect Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}