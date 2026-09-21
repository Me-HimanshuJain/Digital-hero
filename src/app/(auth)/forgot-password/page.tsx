"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) throw resetError;
      
      setMessage("Check your email for the password reset link.");
      
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,196,106,0.1)_0%,transparent_50%)]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2 transition-opacity hover:opacity-80">
             <Trophy className="h-6 w-6 text-primary" />
             <span className="text-xl font-bold tracking-tight text-foreground">
              digital.<span className="text-primary">HEROES.</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-2 text-center text-balance">
            Enter your email address and we'll send you a link to reset your password.
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
          
          <form onSubmit={handleReset} className="space-y-6">
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

            <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
