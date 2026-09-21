import Link from "next/link";

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Overview</h1>
      <p className="text-muted-foreground">
        Welcome to the Digital Heroes command center. Select a module from the sidebar to manage the platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link href="/admin/draws" className="bg-card border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors cursor-pointer group">
          <h3 className="text-lg font-medium group-hover:text-primary transition-colors">Draw Management &rarr;</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Simulate the monthly draw, review the algorithmic prize pool calculations, and publish final results.
          </p>
        </Link>
        
        <div className="bg-card border border-white/5 rounded-2xl p-6 opacity-50">
          <h3 className="text-lg font-medium">Winner Verification</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Review uploaded Golf Memberships/IDs and process bank payouts. (Coming Soon)
          </p>
        </div>
        
        <div className="bg-card border border-white/5 rounded-2xl p-6 opacity-50">
          <h3 className="text-lg font-medium">Platform Analytics</h3>
          <p className="text-sm text-muted-foreground mt-2">
            View subscriber growth, total charity impact, and financial breakdowns. (Coming Soon)
          </p>
        </div>
      </div>
    </div>
  );
}
