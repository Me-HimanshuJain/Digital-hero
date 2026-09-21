"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // Strip max-age to force session cookies on the client
      if (session) {
        document.cookie.split(';').forEach(c => {
          const cookie = c.trim();
          if (cookie.startsWith('sb-') && cookie.includes('-auth-token=')) {
            const [name, ...rest] = cookie.split('=');
            document.cookie = `${name}=${rest.join('=')}; path=/;`;
          }
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Strip max-age to force session cookies on the client when auth changes (e.g. login/refresh)
      if (session) {
        document.cookie.split(';').forEach(c => {
          const cookie = c.trim();
          if (cookie.startsWith('sb-') && cookie.includes('-auth-token=')) {
            const [name, ...rest] = cookie.split('=');
            document.cookie = `${name}=${rest.join('=')}; path=/;`;
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-xl font-bold tracking-tight text-foreground">
              digital.<span className="text-primary">HEROES.</span>
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </Link>
          <Link href="/#draw" className="text-muted-foreground hover:text-foreground transition-colors">
            The Draw
          </Link>
          <Link href="/#charities" className="text-muted-foreground hover:text-foreground transition-colors">
            Charities
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
                Sign In
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Join Heroes
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
