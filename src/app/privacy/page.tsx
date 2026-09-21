import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 py-24 container mx-auto px-4 max-w-4xl space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
            <p>
              At Digital Heroes, we respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username, and Golf Membership/ID (used for winner verification).</li>
              <li><strong>Contact Data:</strong> includes email address and region.</li>
              <li><strong>Financial Data:</strong> includes payment card details (processed securely by Stripe, we do not store full card numbers).</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of subscriptions you have purchased from us.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and services, such as your submitted golf scores.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>To register you as a new user.</li>
              <li>To process and deliver your subscription and charitable donations.</li>
              <li>To manage your participation in the monthly draws.</li>
              <li>To verify your identity if you win a cash prize.</li>
              <li>To improve our website, services, marketing, customer relationships, and experiences.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. 
              In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">5. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for, 
              including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">6. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, 
              correction, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
