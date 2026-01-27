'use server';

/**
 * @fileOverview A mock service to simulate fetching stock market data.
 *
 * - getStockPrice - A function that returns a simulated price for a given ticker.
 */

/**
 * Simulates fetching the current market price for a given stock ticker.
 * In a real application, this would call a financial data API.
 * @param ticker The stock ticker symbol (e.g., 'IAM', 'ATW').
 * @returns A promise that resolves to the simulated stock price.
 */
export async function getStockPrice(ticker: string): Promise<number> {
  console.log(`Simulating API call for ticker: ${ticker}`);

  // Create a pseudo-random but deterministic price based on the ticker.
  // This ensures the same ticker always returns the same "random" price in a session,
  // making it feel more realistic than Math.random().
  const charCodeSum = ticker
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
  const basePrice = 100 + (charCodeSum % 200); // Base price between 100 and 300
  const variation = (charCodeSum % 20) - 10; // Variation between -10 and +10
  
  const price = basePrice + variation;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  return parseFloat(price.toFixed(2));
}
