'use server';
/**
 * @fileOverview A flow to update investment values using an AI tool.
 *
 * - updateInvestmentPrices - A function that takes a list of investments and returns them with updated prices for stocks.
 */

import {ai} from '@/ai/genkit';
import { getStockPrice } from '@/services/market-data-service';
import { UpdateInvestmentPricesInput, UpdateInvestmentPricesInputSchema, UpdateInvestmentPricesOutput, UpdateInvestmentPricesOutputSchema } from '@/lib/types';
import {z} from 'zod';

export async function updateInvestmentPrices(input: UpdateInvestmentPricesInput): Promise<UpdateInvestmentPricesOutput> {
  return updateInvestmentPricesFlow(input);
}

// 1. Define the tool the AI can use.
const stockPriceTool = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Get the current market price of a stock using its ticker symbol.',
    inputSchema: z.object({ ticker: z.string().describe("The stock ticker symbol, e.g., 'IAM' or 'ATW'.") }),
    outputSchema: z.number(),
  },
  async ({ ticker }) => {
    return await getStockPrice(ticker);
  }
);

// 2. Define the prompt that uses the tool.
const updatePricesPrompt = ai.definePrompt({
    name: 'updateInvestmentPricesPrompt',
    input: { schema: UpdateInvestmentPricesInputSchema },
    output: { schema: UpdateInvestmentPricesOutputSchema },
    tools: [stockPriceTool],
    prompt: `You are a financial assistant. You will be given a list of investments.
Your task is to update the current market value for every investment of type 'Action' (which represents a stock).
To do this, you MUST use the 'getStockPrice' tool with the investment's 'ticker' symbol.

- For each investment where 'type' is 'Action' and a 'ticker' is provided, call the tool to get the price and update its 'currentValue'.
- If an investment is not a stock or has no ticker, return it unchanged.
- Ensure your final output is a complete list of all investments, modified or not, conforming to the output schema.

Here is the list of investments:
{{jsonStringify investments}}
`,
});

// 3. Define the flow that orchestrates the process.
const updateInvestmentPricesFlow = ai.defineFlow(
  {
    name: 'updateInvestmentPricesFlow',
    inputSchema: UpdateInvestmentPricesInputSchema,
    outputSchema: UpdateInvestmentPricesOutputSchema,
  },
  async (input) => {
    const {output} = await updatePricesPrompt(input);
    if (!output) {
      throw new Error("The AI failed to return updated investment prices.");
    }
    return output;
  }
);
