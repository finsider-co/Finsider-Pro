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
  const prompt = `
    Find the latest market price (current price) for the following stock tickers: ${tickers}.
    If a ticker is from Hong Kong (e.g., 0700.HK), ensure the price is in HKD.
    If a ticker is US (e.g., AAPL), ensure the price is in USD (but do not convert currencies, just give the raw number).
    
    Return ONLY a JSON array of objects with 'ticker' and 'price' (number).
    Example: [{"ticker": "AAPL", "price": 150.5}, {"ticker": "0700.HK", "price": 320.2}]
  `;

  try {
    // We use gemini-3-pro-preview (or standard) with googleSearch enabled to get real-time info
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better tool use/reasoning
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              price: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const pricesText = response.text;
    if (!pricesText) return holdings;

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
