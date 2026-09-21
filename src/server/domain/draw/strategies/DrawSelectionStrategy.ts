export interface DrawSelectionStrategy {
  /**
   * Generates winning numbers for a draw.
   * @param count The number of numbers to draw (default 5)
   * @param min The minimum possible number (default 1)
   * @param max The maximum possible number (default 45)
   */
  generateWinningNumbers(count?: number, min?: number, max?: number): Promise<number[]>;
}
