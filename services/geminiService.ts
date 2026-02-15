import { GoogleGenAI, Type } from "@google/genai";
import { ClientProfile, InvestmentHolding } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateFinancialInsights = async (
  profile: ClientProfile, 
  context: string
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure your environment variables.";
  }

  const profileSummary = JSON.stringify({
    netWorth: profile.assets.reduce((acc, a) => acc + a.value, 0) - profile.liabilities.reduce((acc, l) => acc + l.amount, 0),
    monthlyIncome: profile.cashFlow.filter(c => c.isIncome && c.frequency === 'Monthly').reduce((acc, c) => acc + c.amount, 0),
    monthlyExpenses: profile.cashFlow.filter(c => !c.isIncome && c.frequency === 'Monthly').reduce((acc, c) => acc + c.amount, 0),
    topAssets: profile.assets.slice(0, 3),
    topLiabilities: profile.liabilities,
    insuranceCoverage: profile.insurance.reduce((acc, i) => acc + i.coverageAmount, 0)
  });

  const prompt = `
    You are a world-class Senior Financial Advisor. 
    Analyze the following client financial data summary:
    ${profileSummary}

    Context: The user is currently viewing the "${context}" section of the dashboard.
    
    Task: Provide a concise, professional, and strategic insight regarding this specific context.
    - If Context is 'DASHBOARD': Give a high-level health check (1 paragraph).
    - If Context is 'NETWORTH': Analyze the asset/liability mix and leverage ratio.
    - If Context is 'CASHFLOW': Analyze the savings rate and burn rate.
    - If Context is 'PORTFOLIO': Comment on diversification (assume standard market conditions).
    - If Context is 'INSURANCE': Check if coverage seems adequate for a high-net-worth individual (rule of thumb: 10x income for life insurance).

    Style: Professional, encouraging, yet critical where necessary. Use bullet points for clarity if needed. Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating financial insights. Please try again later.";
  }
};

export const updatePortfolioPrices = async (holdings: InvestmentHolding[]): Promise<InvestmentHolding[]> => {
  if (!apiKey || holdings.length === 0) return holdings;

  const tickers = holdings.map(h => h.ticker).join(', ');
  
  // Enhanced prompt to ensure tool usage and strictly JSON output
  const prompt = `
    You are a financial data assistant.
    Task: Use the 'googleSearch' tool to find the LATEST REAL-TIME market price for these stock tickers: ${tickers}.
    
    Rules:
    1. You MUST use Google Search to get the current price. Do not use training data.
    2. For Hong Kong stocks (e.g., 0700.HK), price is in HKD.
    3. For US stocks (e.g., AAPL), price is in USD.
    4. Return ONLY a pure JSON array. No markdown formatting (no \`\`\`json), no conversation.
    
    Output Format:
    [{"ticker": "AAPL", "price": 150.5}, {"ticker": "0700.HK", "price": 320.2}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model is better for tool use
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search
        responseMimeType: "application/json",
      }
    });

    let pricesText = response.text;
    if (!pricesText) return holdings;

    // Robust Parsing: Remove markdown code blocks if present
    pricesText = pricesText.replace(/```json/g, '').replace(/```/g, '').trim();

    const priceData = JSON.parse(pricesText) as { ticker: string, price: number }[];
    const priceMap = new Map(priceData.map(p => [p.ticker.toUpperCase(), p.price]));

    return holdings.map(h => {
      const newPrice = priceMap.get(h.ticker.toUpperCase());
      return newPrice ? { ...h, currentPrice: newPrice, lastPriceCheck: new Date().toISOString() } : h;
    });

  } catch (error) {
    console.error("Failed to update stock prices:", error);
    return holdings;
  }
};
