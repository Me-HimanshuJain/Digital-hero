import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Trophy, Users, Shield, Heart, Activity, LogOut, Settings } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-bold text-xl text-primary flex items-center gap-2">
            <Shield className="w-5 h-5" /> Admin Panel
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Activity className="w-4 h-4" /> Overview
          </Link>
          <Link href="/admin/draws" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Trophy className="w-4 h-4" /> Draw Management
          </Link>
          <Link href="/admin/winners" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Users className="w-4 h-4" /> Winners & Payouts
          </Link>
          <Link href="/admin/charities" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Heart className="w-4 h-4" /> Charities
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5 space-y-4">
          <Link href="/dashboard" className="block text-sm text-muted-foreground hover:text-white transition-colors">
            &larr; Back to App
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
