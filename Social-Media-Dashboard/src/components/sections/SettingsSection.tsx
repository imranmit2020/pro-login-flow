"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggler } from "../ThemeToggler";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, AlertCircle, CheckCircle, Database, Plus, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

export function SettingsSection() {
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeBaseDeleting, setKnowledgeBaseDeleting] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Check Gmail authentication status
  const checkGmailAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gmail/messages?limit=1');
      setGmailAuthenticated(response.ok);
      if (!response.ok) {
        const data = await response.json();
        setError(response.status === 401 ? 'Not authenticated' : data.error);
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setGmailAuthenticated(false);
      setError('Failed to check authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkGmailAuth();
  }, []);

  const handleGmailLogin = async () => {
    try {
      setError(null);
      // Redirect to Gmail auth endpoint
      window.location.href = '/api/gmail/auth';
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to initiate Gmail authentication');
    }
  };

  const handleGmailLogout = async () => {
    try {
      setError(null);
      const response = await fetch('/api/gmail/logout');
      const data = await response.json();
      if (data.success) {
        setGmailAuthenticated(false);
        alert('Successfully signed out from Gmail.');
        // Refresh auth status
        await checkGmailAuth();
      } else {
        alert('Failed to sign out: ' + data.error);
        setError(data.error);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setError('An error occurred during sign out');
      alert('An error occurred during sign out.');
    }
  };

  const handleAddMoreKnowledge = () => {
    // Open the knowledge base upload form in a new tab
    window.open('https://ows23hph.rpcl.host/form/82848bc4-5ea2-4e5a-8bb6-3c09b94a8c5d', '_blank');
  };

  const handleDeleteKnowledgeBase = async () => {
    // Confirm deletion
    const confirmed = window.confirm(
      'Are you sure you want to delete the entire knowledge base? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      setKnowledgeBaseDeleting(true);
      
      const response = await fetch('/api/knowledge-base/delete', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Knowledge base deleted successfully!');
      } else {
        alert(`Failed to delete knowledge base: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting knowledge base:', error);
      alert('An error occurred while deleting the knowledge base.');
    } finally {
      setKnowledgeBaseDeleting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset message
    setPasswordChangeMessage(null);
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordChangeMessage({ type: 'error', message: 'All fields are required' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordChangeMessage({ type: 'error', message: 'New password must be at least 6 characters long' });
      return;
    }
    
    try {
      setPasswordChangeLoading(true);
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordChangeMessage({ type: 'success', message: 'Password changed successfully!' });
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordChangeMessage({ type: 'error', message: data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordChangeMessage({ type: 'error', message: 'An error occurred while changing password' });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span>Theme</span>
            <ThemeToggler />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gmail Integration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Gmail Account Status</span>
            </div>
            {isLoading ? (
              <Badge variant="outline">Checking...</Badge>
            ) : gmailAuthenticated ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            {gmailAuthenticated ? (
              <Button variant="outline" onClick={handleGmailLogout}>
                <Mail className="h-4 w-4 mr-2" />
                Sign Out from Gmail
              </Button>
            ) : (
              <Button onClick={handleGmailLogin}>
                <Mail className="h-4 w-4 mr-2" />
                Connect Gmail Account
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={checkGmailAuth} disabled={isLoading}>
              Refresh Status
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {gmailAuthenticated 
              ? "Your Gmail account is connected and ready to use for email management."
              : "Connect your Gmail account to manage emails from the dashboard."
            }
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Knowledge Base Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              Manage your chatbot's knowledge base stored in Pinecone
            </span>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAddMoreKnowledge} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add More Knowledge
              <ExternalLink className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteKnowledgeBase}
              disabled={knowledgeBaseDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {knowledgeBaseDeleting ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Important Notes:</p>
                <ul className="mt-1 text-yellow-700 space-y-1">
                  <li>• "Add More Knowledge" opens an external form to upload new data</li>
                  <li>• "Delete All Data" permanently removes all knowledge base content</li>
                  <li>• Deletion cannot be undone - use with caution</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {passwordChangeMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    passwordChangeMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {passwordChangeMessage.message}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={passwordChangeLoading}
                  className="w-full"
                >
                  {passwordChangeLoading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
