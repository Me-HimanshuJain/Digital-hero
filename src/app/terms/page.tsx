import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 py-24 container mx-auto px-4 max-w-4xl space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Digital Heroes (the "Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
              In addition, when using this Platform's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
            <p>
              Digital Heroes is a platform that allows golfers to track their scores, participate in monthly prize draws, and contribute a portion of their subscription to selected charities. 
              The Platform provides automated handicap indexing tracking, cryptographic draw systems, and personal scoring dashboards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. Subscription and Billing</h2>
            <p>
              By subscribing to the Platform (whether on a monthly or annual basis), you agree to pay the fees associated with your chosen plan. 
              Pricing may vary depending on your selected region. Subscriptions automatically renew unless canceled prior to the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">4. Monthly Draws and Prizes</h2>
            <p>
              To be eligible for the monthly draw, a user must have an active subscription and have submitted exactly 5 valid golf scores during the qualifying period. 
              The draw is conducted using a cryptographically secure random number generator. Prize pools are distributed algorithmically across multiple tiers (Tier 3, 4, and 5 matches).
              Winners will be required to verify their Golf Membership/ID before payouts are processed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">5. Charitable Contributions</h2>
            <p>
              Digital Heroes commits to donating a minimum of 10% of your subscription fee to the charity of your choice from our approved list. 
              Donations are aggregated and distributed periodically according to our internal schedules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">6. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. 
              You agree to accept responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">7. Modifications to Service</h2>
            <p>
              Digital Heroes reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
