import { SupabaseClient } from "@supabase/supabase-js";
import { DrawSelectionStrategy } from "./strategies/DrawSelectionStrategy";
import { PrizePoolCalculator, PrizePoolDistribution } from "./PrizePoolCalculator";

export interface DrawSimulationResult {
  eligibleUsersCount: number;
  winningNumbers: number[];
  poolDistribution: PrizePoolDistribution;
  winners: {
    tier3: number;
    tier4: number;
    tier5: number;
  };
  prizes: {
    tier3PerWinner: number;
    tier4PerWinner: number;
    tier5PerWinner: number;
  };
  nextRollover: number;
}

export class DrawOrchestrator {
  constructor(
    private supabase: SupabaseClient,
    private strategy: DrawSelectionStrategy
  ) {}

  /**
   * Helper to count matches between two arrays of numbers
   */
  private countMatches(userNumbers: number[], winningNumbers: number[]): number {
    return userNumbers.filter(num => winningNumbers.includes(num)).length;
  }

  /**
   * Runs a complete simulation of a draw without writing results to the database.
   * Useful for the Admin preview screen.
   */
  async simulateDraw(): Promise<DrawSimulationResult> {
    // 1. Get eligible users (users with active subscriptions and exactly 5 scores this month)
    // For MVP simulation, we'll fetch users who have an active subscription, 
    // and then check their scores.
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch all active subscribers
    const { data: subs, error: subError } = await this.supabase
      .from("subscriptions")
      .select("user_id")
      .in("status", ["active", "trialing"]);

    if (subError) throw subError;

    if (!subs || subs.length === 0) {
      return this.emptyResult();
    }

    // Fetch scores for these users
    const { data: scores, error: scoreError } = await this.supabase
      .from("scores")
      .select("user_id, score")
      .gte("score_date", startOfMonth.toISOString().split("T")[0]);

    if (scoreError) throw scoreError;

    // Group scores by user
    const userScores = new Map<string, number[]>();
    for (const s of (scores || [])) {
      if (!userScores.has(s.user_id)) {
        userScores.set(s.user_id, []);
      }
      userScores.get(s.user_id)!.push(s.score);
    }

    // Filter to eligible users (must have exactly 5 scores)
    const eligibleUserIds = Array.from(userScores.keys()).filter(uid => userScores.get(uid)!.length === 5);
    
    if (eligibleUserIds.length === 0) {
      return this.emptyResult();
    }

    // 2. Calculate Prize Pool
    // Get last draw's rollover (mocked as 0 for simulation if no previous draws exist)
    const { data: lastDraws } = await this.supabase
      .from("draws")
      .select("rollover_to_next")
      .order("created_at", { ascending: false })
      .limit(1);
      
    const previousRollover = lastDraws && lastDraws.length > 0 ? lastDraws[0].rollover_to_next : 0;
    
    const poolDistribution = PrizePoolCalculator.calculate(eligibleUserIds.length, previousRollover);

    // 3. Generate Winning Numbers
    const winningNumbers = await this.strategy.generateWinningNumbers(5, 1, 45);

    // 4. Find Winners
    let tier3Winners = 0;
    let tier4Winners = 0;
    let tier5Winners = 0;

    for (const uid of eligibleUserIds) {
      const numbers = userScores.get(uid)!;
      const matchCount = this.countMatches(numbers, winningNumbers);

      if (matchCount === 3) tier3Winners++;
      else if (matchCount === 4) tier4Winners++;
      else if (matchCount === 5) tier5Winners++;
    }

    // 5. Calculate Prizes Per Winner
    const tier3Prize = PrizePoolCalculator.calculatePrizePerWinner(poolDistribution.tier_3_match_pool, tier3Winners);
    const tier4Prize = PrizePoolCalculator.calculatePrizePerWinner(poolDistribution.tier_4_match_pool, tier4Winners);
    const tier5Prize = PrizePoolCalculator.calculatePrizePerWinner(poolDistribution.tier_5_match_pool, tier5Winners);

    // 6. Calculate Next Rollover
    // If no one wins a tier, that tier's entire pool rolls over.
    // Plus any remaining pennies from division.
    let nextRollover = 0;
    if (tier3Winners === 0) nextRollover += poolDistribution.tier_3_match_pool;
    else nextRollover += tier3Prize.remainder;

    if (tier4Winners === 0) nextRollover += poolDistribution.tier_4_match_pool;
    else nextRollover += tier4Prize.remainder;

    if (tier5Winners === 0) nextRollover += poolDistribution.tier_5_match_pool;
    else nextRollover += tier5Prize.remainder;

    return {
      eligibleUsersCount: eligibleUserIds.length,
      winningNumbers,
      poolDistribution,
      winners: {
        tier3: tier3Winners,
        tier4: tier4Winners,
        tier5: tier5Winners
      },
      prizes: {
        tier3PerWinner: tier3Prize.prize,
        tier4PerWinner: tier4Prize.prize,
        tier5PerWinner: tier5Prize.prize
      },
      nextRollover: Math.round(nextRollover * 100) / 100
    };
  }

  private emptyResult(): DrawSimulationResult {
    return {
      eligibleUsersCount: 0,
      winningNumbers: [],
      poolDistribution: {
        total_pool: 0, tier_3_match_pool: 0, tier_4_match_pool: 0, tier_5_match_pool: 0, rollover_amount_used: 0
      },
      winners: { tier3: 0, tier4: 0, tier5: 0 },
      prizes: { tier3PerWinner: 0, tier4PerWinner: 0, tier5PerWinner: 0 },
      nextRollover: 0
    };
  }

  /**
   * Generates a completely mocked simulation with N users for testing/demo purposes.
   */
  async mockSimulateDraw(mockUserCount: number = 1000, previousRollover: number = 0): Promise<DrawSimulationResult> {
    const winningNumbers = await this.strategy.generateWinningNumbers(5, 1, 45);
    const poolDistribution = PrizePoolCalculator.calculate(mockUserCount, previousRollover);

    let tier3Winners = 0;
    let tier4Winners = 0;
    let tier5Winners = 0;

    // Simulate N users, each picking 5 random numbers
    for (let i = 0; i < mockUserCount; i++) {
      const userNumbers = await this.strategy.generateWinningNumbers(5, 1, 45);
      const matchCount = this.countMatches(userNumbers, winningNumbers);

      if (matchCount === 3) tier3Winners++;
      else if (matchCount === 4) tier4Winners++;
      else if (matchCount === 5) tier5Winners++;
    }

    const tier3Prize = PrizePoolCalculator.calculatePrizePerWinner(poolDistribution.tier_3_match_pool, tier3Winners);
    const tier4Prize = PrizePoolCalculator.calculatePrizePerWinner(poolDistribution.tier_4_match_pool, tier4Winners);
    const tier5Prize = PrizePoolCalculator.calculatePrizePerWinner(poolDistribution.tier_5_match_pool, tier5Winners);

    let nextRollover = 0;
    if (tier3Winners === 0) nextRollover += poolDistribution.tier_3_match_pool;
    else nextRollover += tier3Prize.remainder;

    if (tier4Winners === 0) nextRollover += poolDistribution.tier_4_match_pool;
    else nextRollover += tier4Prize.remainder;

    if (tier5Winners === 0) nextRollover += poolDistribution.tier_5_match_pool;
    else nextRollover += tier5Prize.remainder;

    return {
      eligibleUsersCount: mockUserCount,
      winningNumbers,
      poolDistribution,
      winners: { tier3: tier3Winners, tier4: tier4Winners, tier5: tier5Winners },
      prizes: { tier3PerWinner: tier3Prize.prize, tier4PerWinner: tier4Prize.prize, tier5PerWinner: tier5Prize.prize },
      nextRollover: Math.round(nextRollover * 100) / 100
    };
  }
}

