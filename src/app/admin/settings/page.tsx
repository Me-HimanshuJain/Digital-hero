"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings, Save, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [password, setPassword] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (data) setFullName(data.full_name || "");
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage("Failed to save settings: " + error.message);
    } else {
      setMessage("Settings saved successfully!");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage("");

    const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
    if (!isStrong) {
      setPasswordMessage("Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    
    if (error) {
      setPasswordMessage("Failed to update password: " + error.message);
    } else {
      setPasswordMessage("Password updated successfully!");
      setPassword("");
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your administrative profile and security preferences.
        </p>
      </div>

      <div className="bg-card border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" /> Profile Information
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Admin Name"
              required
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>

          {message && (
            <p className={`text-sm text-center ${message.includes("success") ? "text-primary" : "text-destructive"}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      <div className="bg-card border border-white/10 rounded-2xl p-6 mt-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" /> Change Password
        </h2>
        
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Must include uppercase, lowercase, numbers, and special characters.</p>
          </div>

          <Button type="submit" disabled={savingPassword} className="w-full">
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Update Password
          </Button>

          {passwordMessage && (
            <p className={`text-sm text-center ${passwordMessage.includes("success") ? "text-primary" : "text-destructive"}`}>
              {passwordMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
