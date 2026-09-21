"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy } from "lucide-react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("UK");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRobotVerified, setIsRobotVerified] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isRobotVerified) {
      setError("Please confirm you are not a robot.");
      setLoading(false);
      return;
    }

    const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
    if (!isStrong) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            region: region,
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // Usually redirects to email confirmation, but for now we'll route to dashboard or login
      if (data.session) {
        if (next) {
          router.push(next);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push(`/login?message=Check your email for the confirmation link.${next ? `&next=${next}` : ''}`);
      }
      
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up.");
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
          <h1 className="text-3xl font-bold tracking-tight mt-4">Create an account</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Join the premium performance platform
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-background/50 border-white/10 h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region / Currency</Label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="flex h-12 w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="UK">United Kingdom (GBP £)</option>
                <option value="India">India (INR ₹)</option>
                <option value="USA">United States (USD $)</option>
              </select>
            </div>
            
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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 border-white/10 h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">Must include uppercase, lowercase, numbers, and special characters.</p>
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
              {loading ? "Creating account..." : "Join Heroes"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/login${next ? `?next=${next}` : ''}`} className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
