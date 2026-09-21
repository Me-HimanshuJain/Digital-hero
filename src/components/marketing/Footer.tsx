import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background text-muted-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold tracking-tight text-foreground">
                digital.<span className="text-primary">HEROES.</span>
              </span>
            </Link>
            <p className="text-sm">
              Play your game. Make an impact. Win together.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link href="/#draw" className="hover:text-primary transition-colors">Monthly Draw</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Impact</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#charities" className="hover:text-primary transition-colors">Our Charities</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <span className="opacity-50">Build: 2026 Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
