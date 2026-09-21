"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SessionFixer() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // 1. On Load: Check if we are restoring from a closed tab
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const navType = (navEntries[0] as PerformanceNavigationTiming).type;
      
      if (navType === "reload" || navType === "back_forward") {
        // Safe navigation (F5 or Back button). Restore cookies if we backed them up.
        const backup = sessionStorage.getItem('sb_cookie_backup');
        if (backup) {
          try {
            const cookies = JSON.parse(backup);
            cookies.forEach((c: string) => {
              document.cookie = `${c}; path=/`;
            });
          } catch (e) {}
        }
      } else {
        // This is a fresh 'navigate'. If this is a Ctrl+Shift+T tab restore, Chrome restored the session cookies.
        // We must aggressively delete them to enforce a hard logout!
        sessionStorage.removeItem('sb_cookie_backup');
        
        let loggedOut = false;
        document.cookie.split(';').forEach(c => {
          const cookie = c.trim();
          if (cookie.startsWith('sb-') && cookie.includes('-auth-token=')) {
            const name = cookie.split('=')[0];
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            loggedOut = true;
          }
        });

        // Also clean up localStorage just in case Supabase leaked tokens there
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('sb-') && key?.endsWith('-auth-token')) {
            localStorage.removeItem(key);
            loggedOut = true;
          }
        }
        
        if (loggedOut) {
          supabase.auth.signOut();
          router.refresh();
        }
      }
    }

    // 2. Helper to strip max-age from cookies while active
    const enforceSessionCookies = () => {
      document.cookie.split(';').forEach(c => {
        const cookie = c.trim();
        if (cookie.startsWith('sb-') && cookie.includes('-auth-token=')) {
          const [name, ...rest] = cookie.split('=');
          document.cookie = `${name}=${rest.join('=')}; path=/;`;
        }
      });
    };

    enforceSessionCookies();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      enforceSessionCookies();
    });

    // 3. On Page Hide (Tab Close / Refresh), backup and destroy cookies!
    const handlePageHide = () => {
      const sbCookies = document.cookie.split(';').filter(c => c.trim().startsWith('sb-'));
      sessionStorage.setItem('sb_cookie_backup', JSON.stringify(sbCookies));
      
      sbCookies.forEach(c => {
        const name = c.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [supabase.auth, router]);

  return null;
}
