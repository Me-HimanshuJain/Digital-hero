export interface PrizePoolDistribution {
  total_pool: number;
  tier_3_match_pool: number; // 25%
  tier_4_match_pool: number; // 35%
  tier_5_match_pool: number; // 40% + rollover
  rollover_amount_used: number;
}

export class PrizePoolCalculator {
  // Configurable rules
  private static readonly CONTRIBUTION_PER_USER = 2.00; // £2 from every sub
  private static readonly TIER_3_PCT = 0.25;
  private static readonly TIER_4_PCT = 0.35;
  private static readonly TIER_5_PCT = 0.40;

  /**
   * Calculates the total prize pool and its distribution
   * @param eligibleUsers Number of subscribers qualified for the draw
   * @param previousRollover Rollover amount from the previous draw
   * @returns The distribution object
   */
  static calculate(eligibleUsers: number, previousRollover: number = 0): PrizePoolDistribution {
    const basePool = eligibleUsers * this.CONTRIBUTION_PER_USER;

    // We round to 2 decimal places to handle float precision issues with money
    const tier3 = Math.round((basePool * this.TIER_3_PCT) * 100) / 100;
    const tier4 = Math.round((basePool * this.TIER_4_PCT) * 100) / 100;
    
    // Tier 5 gets the remaining percentage of the base pool, plus the rollover
    const tier5Base = Math.round((basePool * this.TIER_5_PCT) * 100) / 100;
    
    // Adjust to ensure exactly 100% of basePool is used (fixing 1-cent rounding errors)
    const exactTier5Base = Math.round((basePool - tier3 - tier4) * 100) / 100;

    return {
      total_pool: basePool + previousRollover,
      tier_3_match_pool: tier3,
      tier_4_match_pool: tier4,
      tier_5_match_pool: exactTier5Base + previousRollover,
      rollover_amount_used: previousRollover,
    };
  }

  /**
   * Calculates the prize per winner for a specific tier
   * @param tierPool The total money allocated to this tier
   * @param winnerCount The number of winners in this tier
   * @returns Individual prize amount (rounded down to nearest penny), and any undivided remainder
   */
  static calculatePrizePerWinner(tierPool: number, winnerCount: number): { prize: number, remainder: number } {
    if (winnerCount === 0 || tierPool === 0) return { prize: 0, remainder: tierPool };

    // Work in pennies to avoid float issues
    const tierPoolPennies = Math.round(tierPool * 100);
    const prizePennies = Math.floor(tierPoolPennies / winnerCount);
    
    const remainderPennies = tierPoolPennies - (prizePennies * winnerCount);

    return {
      prize: prizePennies / 100,
      remainder: remainderPennies / 100
    };
  }
}
