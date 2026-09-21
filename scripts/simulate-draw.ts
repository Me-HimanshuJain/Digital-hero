import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { DrawOrchestrator } from "../src/server/domain/draw/DrawOrchestrator";
import { RandomSelectionStrategy } from "../src/server/domain/draw/strategies/RandomSelectionStrategy";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function run() {
  console.log("=== DRAW ENGINE SIMULATION ===");

  const strategy = new RandomSelectionStrategy();
  const orchestrator = new DrawOrchestrator(supabase, strategy);

  console.log("Running simulation with 10,000 users and £1500 rollover...");
  try {
    const result = await orchestrator.mockSimulateDraw(10000, 1500);
    
    console.log("\n--- RESULT ---");
    console.log(`Eligible Users: ${result.eligibleUsersCount}`);
    console.log(`Winning Numbers: ${result.winningNumbers.join(", ")}`);
    
    console.log("\n--- PRIZE POOL ---");
    console.log(`Total Pool: £${result.poolDistribution.total_pool}`);
    console.log(`Tier 3 Pool (25%): £${result.poolDistribution.tier_3_match_pool}`);
    console.log(`Tier 4 Pool (35%): £${result.poolDistribution.tier_4_match_pool}`);
    console.log(`Tier 5 Pool (40% + Rollover): £${result.poolDistribution.tier_5_match_pool}`);
    
    console.log("\n--- WINNERS ---");
    console.log(`Tier 3 (3 matches): ${result.winners.tier3} winners (£${result.prizes.tier3PerWinner} each)`);
    console.log(`Tier 4 (4 matches): ${result.winners.tier4} winners (£${result.prizes.tier4PerWinner} each)`);
    console.log(`Tier 5 (5 matches): ${result.winners.tier5} winners (£${result.prizes.tier5PerWinner} each)`);
    
    console.log(`\nNext Draw Rollover: £${result.nextRollover}`);
    
  } catch (e) {
    console.error("Simulation failed:", e);
  }
}

run();
