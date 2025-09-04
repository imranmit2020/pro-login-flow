"use client";

import { useState } from "react";
import { FutureCard, GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Facebook, Instagram, MessageCircle, Users, Clock, Settings, Plus, ChevronRight, Activity, TrendingUp, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useSocialPages, SocialPage } from "@/hooks/useSocialPages";

// Additional imports for form components
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

// Note: Select components defined but removed as they're not used in this component

// SocialPage interface moved to useSocialPages hook

interface AddPageFormData {
  platform: 'facebook' | 'instagram' | '';
  pageName: string;
  pageId: string;
  accessToken: string;
  appId: string;
  appSecret: string;
}

export function SocialPagesSection() {
  const { pages, loading, error, refetch } = useSocialPages();
  // selectedPage state removed as it was unused
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
    
    // Close dialog and reset form
    handleCloseDialog();
    
    // Here you would typically make an API call to save the credentials
    console.log('Adding new page:', formData);
    
    // Refresh the pages data to reflect any changes
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

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="text-center mb-8 flex-shrink-0">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 bg-clip-text text-transparent">
            Social Media Pages
          </h1>
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
        </div>
        <p className="text-muted-foreground text-lg">
          Manage multiple Facebook and Instagram pages from one dashboard
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 pr-2">
        <div className="space-y-8 pb-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-muted-foreground">Loading your social media pages...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-4">
                <p className="text-red-600 dark:text-red-400 mb-2">Error loading pages: {error}</p>
                <Button onClick={refetch} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Content - only show when not loading */}
          {!loading && (
            <>
              {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FutureCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Pages</CardTitle>
                <Activity className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{connectedPages.length}</div>
                <p className="text-xs text-muted-foreground">of {pages.length} total</p>
              </CardContent>
            </FutureCard>

            <FutureCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageCircle className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{totalMessages}</div>
                <p className="text-xs text-muted-foreground">across all pages</p>
              </CardContent>
            </FutureCard>



            <FutureCard>
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
            </FutureCard>
          </div>

          {/* Pages Grid - Scrollable when many pages */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Pages</h2>
              <div className="text-sm text-muted-foreground">
                {pages.length} page{pages.length !== 1 ? 's' : ''} total
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 pr-2">
              {pages.map((page) => (
                <GlassCard key={page.id} className="group cursor-pointer transition-all duration-300 hover:scale-105 flex-shrink-0">
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

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {page.stats.followers.toLocaleString()} followers
                            </span>
                          </div>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>

                        <div className="space-y-2">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
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
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                            Connect Page
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>
              ))}

              {/* Add New Page Card */}
              <GlassCard className="group cursor-pointer transition-all duration-300 hover:scale-105 border-dashed flex-shrink-0">
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Add New Page</h3>
                    <p className="text-sm text-muted-foreground">Connect another Facebook or Instagram page</p>
                  </div>
                  <Button onClick={handleAddPage} className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                    Add Page
                  </Button>
                </CardContent>
              </GlassCard>
            </div>
          </div>

          
            </>
          )}
        </div>
      </div>

      {/* Add Page Dialog - Also with scrollable content */}
      <Dialog open={showAddPageDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Connect Social Media Page</DialogTitle>
            <DialogDescription>
              Follow the steps below to connect your Facebook Page or Instagram Business Account
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 pr-2">
            <form onSubmit={handleFormSubmit} className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">1. Choose Platform</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.platform === 'facebook' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('platform', 'facebook')}
                    className="flex-1 justify-start gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook Page
                  </Button>
                  <Button
                    type="button"
                    variant={formData.platform === 'instagram' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('platform', 'instagram')}
                    className="flex-1 justify-start gap-2"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram Business
                  </Button>
                </div>
              </div>

              {/* Show setup instructions based on selected platform */}
              {formData.platform && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    {formData.platform === 'facebook' ? 'Facebook Page Setup Guide' : 'Instagram Business Setup Guide'}
                  </h4>
                  <div className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
                    {formData.platform === 'facebook' ? (
                      <>
                        <p><strong>Step 1:</strong> Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Facebook Developers</a></p>
                        <p><strong>Step 2:</strong> Create an app or use existing one</p>
                        <p><strong>Step 3:</strong> Add "Facebook Login" and "Webhooks" products</p>
                        <p><strong>Step 4:</strong> Get Page Access Token from <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Graph API Explorer</a></p>
                        <p><strong>Step 5:</strong> Make sure you're an admin of the Facebook Page</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Step 1:</strong> Convert to Instagram Business Account (if not already)</p>
                        <p><strong>Step 2:</strong> Connect Instagram to a Facebook Page</p>
                        <p><strong>Step 3:</strong> Get Facebook Page Access Token (Instagram uses Facebook API)</p>
                        <p><strong>Step 4:</strong> Find your Instagram Business Account ID</p>
                        <p><strong>Step 5:</strong> Ensure all required permissions are granted</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="pageName">2. Page Name</Label>
                <Input 
                  id="pageName" 
                  placeholder={formData.platform === 'facebook' ? "e.g. OfinaPulse Business" : "e.g. @ofinapulse_official"}
                  value={formData.pageName} 
                  onChange={(e) => handleInputChange('pageName', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.platform === 'facebook' ? 'Your Facebook Page name' : 'Your Instagram Business Account username'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pageId">3. {formData.platform === 'facebook' ? 'Facebook Page ID' : 'Instagram Business Account ID'}</Label>
                <Input 
                  id="pageId" 
                  placeholder={formData.platform === 'facebook' ? "e.g. 123456789012345" : "e.g. 17841475533389585"}
                  value={formData.pageId} 
                  onChange={(e) => handleInputChange('pageId', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.platform === 'facebook' 
                    ? 'Find this in your Facebook Page settings or Graph API Explorer' 
                    : 'Get this from Graph API Explorer: me/accounts?fields=instagram_business_account'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessToken">4. {formData.platform === 'facebook' ? 'Facebook Page Access Token' : 'Facebook Page Access Token (for Instagram)'}</Label>
                <div className="flex gap-2">
                  <Input 
                    id="accessToken" 
                    placeholder="EAAxxxxxxx... (starts with EAA)"
                    value={formData.accessToken} 
                    onChange={(e) => handleInputChange('accessToken', e.target.value)}
                    type={showPassword.accessToken ? "text" : "password"}
                    className="flex-1"
                    required
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    onClick={() => togglePasswordVisibility('accessToken')}
                  >
                    {showPassword.accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Long-lived Page Access Token (not User Access Token). Get from Graph API Explorer.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appId">5. Facebook App ID</Label>
                <Input 
                  id="appId" 
                  placeholder="e.g. 1234567890123456"
                  value={formData.appId} 
                  onChange={(e) => handleInputChange('appId', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your Facebook App's ID from developers.facebook.com
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appSecret">6. Facebook App Secret</Label>
                <div className="flex gap-2">
                  <Input 
                    id="appSecret" 
                    placeholder="Keep this secret and secure"
                    value={formData.appSecret} 
                    onChange={(e) => handleInputChange('appSecret', e.target.value)}
                    type={showPassword.appSecret ? "text" : "password"}
                    className="flex-1"
                    required
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    onClick={() => togglePasswordVisibility('appSecret')}
                  >
                    {showPassword.appSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Facebook App's secret key. Never share this publicly.
                </p>
              </div>
              {/* Required Permissions Note */}
              {formData.platform && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                    Required Permissions
                  </h4>
                  <div className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                    {formData.platform === 'facebook' ? (
                      <>
                        <p>• <strong>pages_show_list</strong> - To access your pages</p>
                        <p>• <strong>pages_messaging</strong> - To send/receive messages</p>
                        <p>• <strong>pages_read_engagement</strong> - To read message statistics</p>
                        <p>• <strong>pages_manage_metadata</strong> - To read page information</p>
                      </>
                    ) : (
                      <>
                        <p>• <strong>instagram_basic</strong> - To access Instagram account</p>
                        <p>• <strong>instagram_manage_messages</strong> - To manage DMs</p>
                        <p>• <strong>pages_messaging</strong> - Required for Instagram messaging</p>
                        <p>• <strong>pages_show_list</strong> - To access connected Facebook page</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 border-t space-x-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => window.open('https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/', '_blank')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Setup Guide
            </Button>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleFormSubmit}
              disabled={!formData.platform || !formData.pageName || !formData.pageId || !formData.accessToken || !formData.appId || !formData.appSecret}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              Connect Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 