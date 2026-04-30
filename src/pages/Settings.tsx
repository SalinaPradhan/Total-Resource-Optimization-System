import { Save, Bell, Database, Shield, Palette, Clock, Crown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserManagementPanel } from "@/components/settings/UserManagementPanel";
import { CoordinatorAssignmentPanel } from "@/components/settings/CoordinatorAssignmentPanel";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { isSuperAdmin } = useAuth();

  return (
    <div className="min-h-screen">
      <Header 
        title="Settings" 
        subtitle="Configure system preferences and options"
      />
      
      <div className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* General Settings */}
          <Card className="glass-card border-border animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic system configuration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institution Name</Label>
                  <Input defaultValue="University of Technology" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select defaultValue="2024-25">
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default Time Zone</Label>
                <Select defaultValue="ist">
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <CardTitle>Schedule Settings</CardTitle>
                  <CardDescription>Configure timetable parameters</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class Duration (minutes)</Label>
                  <Input type="number" defaultValue="60" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Break Duration (minutes)</Label>
                  <Input type="number" defaultValue="10" className="bg-secondary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day Start Time</Label>
                  <Input type="time" defaultValue="09:00" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Day End Time</Label>
                  <Input type="time" defaultValue="17:00" className="bg-secondary/50" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Include Saturdays</Label>
                  <p className="text-xs text-muted-foreground">Schedule classes on Saturdays</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Bell className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure alert preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Conflict Alerts</Label>
                  <p className="text-xs text-muted-foreground">Alert on scheduling conflicts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Resource Warnings</Label>
                  <p className="text-xs text-muted-foreground">Alert on resource shortages</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* User Role Management - visible to super_admin */}
          {isSuperAdmin && (
            <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
              <UserManagementPanel />
            </div>
          )}

          {/* Coordinator Assignments - only super_admin */}
          {isSuperAdmin && (
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CoordinatorAssignmentPanel />
            </div>
          )}

          {/* Database */}
          <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: '250ms' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/20">
                  <Database className="w-4 h-4 text-info" />
                </div>
                <div>
                  <CardTitle>Database</CardTitle>
                  <CardDescription>Data management options</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-xs text-muted-foreground">Daily automatic backups</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline">Export Data</Button>
                <Button variant="outline">Import Data</Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="gradient" size="lg">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
