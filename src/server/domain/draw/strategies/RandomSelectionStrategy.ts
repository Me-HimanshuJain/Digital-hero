import { randomBytes } from "crypto";
import { DrawSelectionStrategy } from "./DrawSelectionStrategy";

export class RandomSelectionStrategy implements DrawSelectionStrategy {
  /**
   * Generates secure random numbers for a draw using crypto.randomBytes
   */
  async generateWinningNumbers(count = 5, min = 1, max = 45): Promise<number[]> {
    if (count > (max - min + 1)) {
      throw new Error("Cannot draw more unique numbers than the available range.");
    }

    const numbers = new Set<number>();
    
    while (numbers.size < count) {
      // Generate a random byte (0-255)
      const byte = randomBytes(1)[0];
      
      // Calculate a fair random number within the range
      // To avoid modulo bias, we reject bytes that fall in the upper remainder
      const range = max - min + 1;
      const maxValidByte = 256 - (256 % range);
      
      if (byte < maxValidByte) {
        const randomNumber = (byte % range) + min;
        numbers.add(randomNumber);
      }
    }

    // Return sorted array
    return Array.from(numbers).sort((a, b) => a - b);
  }
}
