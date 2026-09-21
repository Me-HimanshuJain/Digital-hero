"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRobotVerified, setIsRobotVerified] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const next = searchParams.get("next");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isRobotVerified) {
      setError("Please confirm you are not a robot.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      // Check role to redirect appropriately
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (next) {
        router.push(next);
      } else if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,196,106,0.1)_0%,transparent_50%)]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2 transition-opacity hover:opacity-80">
             <Trophy className="h-6 w-6 text-primary" />
             <span className="text-xl font-bold tracking-tight text-foreground">
              digital.<span className="text-primary">HEROES.</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Sign in to your account to track scores
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
          {message && (
            <div className="mb-6 p-4 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-white/10 h-12"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 border-white/10 h-12"
              />
            </div>

            {/* Fake reCAPTCHA style checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-background/50 border border-white/10 rounded-lg max-w-[280px]">
              <input 
                type="checkbox" 
                id="robot" 
                className="w-6 h-6 rounded border-white/20 accent-primary cursor-pointer"
                checked={isRobotVerified}
                onChange={(e) => setIsRobotVerified(e.target.checked)}
              />
              <Label htmlFor="robot" className="cursor-pointer font-medium select-none">I'm not a robot</Label>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href={`/signup${next ? `?next=${next}` : ''}`} className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
