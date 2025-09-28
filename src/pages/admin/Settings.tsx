import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Globe,
  Shield,
  Mail,
  Database,
  Palette,
  Bell,
  Key,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'QriptoMedia',
    siteDescription: 'Learn-to-Earn and Civic Readiness Platform',
    contactEmail: 'admin@qriptomedia.com',
    
    // Features
    enableRegistration: true,
    enableEmailVerification: true,
    enableSocialLogin: true,
    enableContentComments: false,
    
    // Security
    enableTwoFactor: false,
    enablePasswordPolicy: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Content
    defaultContentStatus: 'draft',
    autoPublishScheduled: true,
    enableContentModeration: true,
    maxUploadSize: 20,
    
    // Notifications
    emailNotifications: true,
    adminAlerts: true,
    userWelcomeEmail: true,
    contentPublishNotification: true
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real application, you would save these settings to the database
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your platform settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSetting('contactEmail', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => updateSetting('siteDescription', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Feature Settings
          </CardTitle>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>User Registration</Label>
              <p className="text-sm text-muted-foreground">Allow new users to register</p>
            </div>
            <Switch
              checked={settings.enableRegistration}
              onCheckedChange={(checked) => updateSetting('enableRegistration', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Verification</Label>
              <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
            </div>
            <Switch
              checked={settings.enableEmailVerification}
              onCheckedChange={(checked) => updateSetting('enableEmailVerification', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Social Login</Label>
              <p className="text-sm text-muted-foreground">Enable Google and LinkedIn login</p>
            </div>
            <Switch
              checked={settings.enableSocialLogin}
              onCheckedChange={(checked) => updateSetting('enableSocialLogin', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Content Comments</Label>
              <p className="text-sm text-muted-foreground">Allow users to comment on content</p>
            </div>
            <Switch
              checked={settings.enableContentComments}
              onCheckedChange={(checked) => updateSetting('enableContentComments', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Configure security and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
            </div>
            <Switch
              checked={settings.enableTwoFactor}
              onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Policy</Label>
              <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
            </div>
            <Switch
              checked={settings.enablePasswordPolicy}
              onCheckedChange={(checked) => updateSetting('enablePasswordPolicy', checked)}
            />
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Content Settings
          </CardTitle>
          <CardDescription>Configure content management options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="defaultContentStatus">Default Content Status</Label>
              <select
                id="defaultContentStatus"
                value={settings.defaultContentStatus}
                onChange={(e) => updateSetting('defaultContentStatus', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
              <Input
                id="maxUploadSize"
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => updateSetting('maxUploadSize', parseInt(e.target.value))}
              />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-publish Scheduled Content</Label>
              <p className="text-sm text-muted-foreground">Automatically publish content at scheduled time</p>
            </div>
            <Switch
              checked={settings.autoPublishScheduled}
              onCheckedChange={(checked) => updateSetting('autoPublishScheduled', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Content Moderation</Label>
              <p className="text-sm text-muted-foreground">Enable content moderation workflow</p>
            </div>
            <Switch
              checked={settings.enableContentModeration}
              onCheckedChange={(checked) => updateSetting('enableContentModeration', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure email and system notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send email notifications to users</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Admin Alerts</Label>
              <p className="text-sm text-muted-foreground">Send alerts to administrators</p>
            </div>
            <Switch
              checked={settings.adminAlerts}
              onCheckedChange={(checked) => updateSetting('adminAlerts', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Welcome Email</Label>
              <p className="text-sm text-muted-foreground">Send welcome email to new users</p>
            </div>
            <Switch
              checked={settings.userWelcomeEmail}
              onCheckedChange={(checked) => updateSetting('userWelcomeEmail', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Content Publish Notifications</Label>
              <p className="text-sm text-muted-foreground">Notify users when new content is published</p>
            </div>
            <Switch
              checked={settings.contentPublishNotification}
              onCheckedChange={(checked) => updateSetting('contentPublishNotification', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}