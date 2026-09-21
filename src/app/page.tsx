import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { HeroScene } from "@/components/3d/HeroScene";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Trophy, Heart, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-16">
        <HeroScene />
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start justify-center">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Join the 2026 Edition Draw
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance font-heading">
              Play your game. <br/>
              <span className="text-primary">Make an impact.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
              The premium performance platform where your golf scores become your ticket to monthly rewards, while automatically supporting charities you care about.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                  Join Digital Heroes <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-white/10 hover:bg-white/5 backdrop-blur-sm">
                  Explore How it Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Section (How It Works) */}
      <section id="how-it-works" className="py-24 bg-card/30 border-y border-white/5 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div id="how-it-works-item" className="flex flex-col space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Track & Win</h3>
              <p className="text-muted-foreground">Log your latest five Stableford scores. These scores automatically enter you into our premium monthly prize draw.</p>
            </div>
            <div id="charities" className="flex flex-col space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Give Back</h3>
              <p className="text-muted-foreground">A minimum of 10% of your subscription goes directly to a charity you choose. Make every round matter.</p>
            </div>
            <div id="draw" className="flex flex-col space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Verified Trust</h3>
              <p className="text-muted-foreground">Cryptographic draw engine with full transparency. Win up to a 5-number jackpot with secure payouts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Basic content placeholder for other sections */}
      <section className="py-32 relative z-10 bg-background">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold font-heading">Ready to step up?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join the community of golfers combining their passion for the game with real-world impact.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="h-12 px-8">View Subscription Plans</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
