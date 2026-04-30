import { useState, useEffect } from "react";
import { User, Mail, Building, Lock, Save, Camera, Shield, GraduationCap, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, role, isAdmin, isFaculty } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, department")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setDepartment(data.department || "");
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, department, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    } else {
      // Also update user metadata
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "New password and confirmation must match." });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Password too short", description: "Password must be at least 6 characters." });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ variant: "destructive", title: "Password change failed", description: error.message });
    } else {
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="w-4 h-4" />;
    if (isFaculty) return <Users className="w-4 h-4" />;
    return <GraduationCap className="w-4 h-4" />;
  };

  const getRoleBadgeStyle = () => {
    if (isAdmin) return "bg-destructive/20 text-destructive border-destructive/30";
    if (isFaculty) return "bg-primary/20 text-primary border-primary/30";
    return "bg-accent/20 text-accent border-accent/30";
  };

  const initials = (fullName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen">
      <Header title="Profile" subtitle="Manage your account information" />

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="glass-card border-border animate-slide-up overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-2 sm:pt-0">
                <h2 className="text-xl font-semibold">{fullName || user?.email?.split("@")[0]}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${getRoleBadgeStyle()}`}>
                  {getRoleIcon()}
                  {role || "User"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: "50ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name and department</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-secondary/50"
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="bg-secondary/50"
                  disabled={profileLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateProfile} disabled={loading} variant="gradient">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Lock className="w-4 h-4 text-warning" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-secondary/50"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} disabled={passwordLoading || !newPassword} variant="outline">
                <Lock className="w-4 h-4 mr-2" />
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="glass-card border-border animate-slide-up" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/20">
                <Shield className="w-4 h-4 text-info" />
              </div>
              <div>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Read-only account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Account ID</span>
              <span className="text-sm font-mono text-foreground/70">{user?.id?.slice(0, 8)}...</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Last Sign In</span>
              <span className="text-sm">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
