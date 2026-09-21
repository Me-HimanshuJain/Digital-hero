import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Home, Settings, CreditCard, Heart, LogOut, PlusCircle, Gift, LayoutDashboard, Target, FileText } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 bg-card/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              digital.<span className="text-primary">HEROES.</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
            <Home className="h-5 w-5" />
            <span className="font-medium">Overview</span>
          </Link>
          <Link href="/dashboard/draws" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Trophy className="w-4 h-4" /> Monthly Draws
          </Link>
          <Link href="/dashboard/winnings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Gift className="w-4 h-4" /> My Winnings
          </Link>
          <Link href="/dashboard/charities" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5 hover:text-primary transition-colors">
            <Heart className="h-5 w-5" />
            <span className="font-medium">My Impact</span>
          </Link>
          <Link href="/pricing" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Subscription</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {profile?.full_name?.charAt(0) || data.user.email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{data.user.email}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
