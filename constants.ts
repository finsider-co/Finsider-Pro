import { ClientProfile, AssetType, LiabilityType } from './types';

export const MOCK_CLIENT: ClientProfile = {
  id: 'c-001',
  name: '陳大文 (Alex Chan)',
  email: 'alex.chan@example.com',
  phone: '+852 9123 4567',
  notes: '高淨值客戶，專注於提早退休及資產傳承規劃。',
  lastMeetingDate: '2024-02-15',
  lastUpdated: new Date().toISOString(),
  age: 42,
  retirementAge: 60,
  assets: [
    { id: 'a1', name: '自住物業 (九龍塘)', type: AssetType.REAL_ESTATE, value: 15000000, currency: 'HKD' },
    { id: 'a2', name: '高息活期存款', type: AssetType.CASH, value: 2500000, currency: 'HKD' },
    { id: 'a3', name: '科技增長 ETF', type: AssetType.EQUITY, value: 4500000, currency: 'HKD' },
    { id: 'a4', name: '環球債券基金', type: AssetType.FIXED_INCOME, value: 2000000, currency: 'HKD' },
    { id: 'a5', name: '收租物業 (灣仔)', type: AssetType.REAL_ESTATE, value: 6000000, currency: 'HKD' },
    { id: 'a6', name: '加密貨幣資產', type: AssetType.ALTERNATIVE, value: 500000, currency: 'HKD' },
  ],
  liabilities: [
    { id: 'l1', name: '按揭 (自住)', type: LiabilityType.MORTGAGE, amount: 8500000, interestRate: 3.5, monthlyPayment: 38000 },
    { id: 'l2', name: '車貸 (Tesla)', type: LiabilityType.LOAN, amount: 450000, interestRate: 4.5, monthlyPayment: 9000 },
  ],
  cashFlow: [
    { id: 'inc1', category: '薪金收入', amount: 120000, frequency: 'Monthly', isIncome: true },
    { id: 'inc2', category: '租金收入', amount: 25000, frequency: 'Monthly', isIncome: true },
    { id: 'inc3', category: '股息收入', amount: 120000, frequency: 'Annually', isIncome: true },
    { id: 'exp1', category: '按揭供款', amount: 38000, frequency: 'Monthly', isIncome: false },
    { id: 'exp2', category: '生活開支', amount: 30000, frequency: 'Monthly', isIncome: false },
    { id: 'exp3', category: '子女教育', amount: 15000, frequency: 'Monthly', isIncome: false },
    { id: 'exp4', category: '保費支出', amount: 8000, frequency: 'Monthly', isIncome: false },
    { id: 'exp5', category: '旅遊及娛樂', amount: 10000, frequency: 'Monthly', isIncome: false },
  ],
  insurance: [
    { id: 'ins1', provider: '保誠 (Prudential)', type: 'Life', nature: 'Consumption', coverageAmount: 5000000, premium: 2500, premiumFrequency: 'Monthly', beneficiary: '配偶', totalPremiumsPaid: 150000, policyNotes: '包括傷殘條款' },
    { id: 'ins2', provider: '友邦 (AIA)', type: 'Health', nature: 'Consumption', coverageAmount: 0, premium: 1500, premiumFrequency: 'Monthly', beneficiary: '家庭', totalPremiumsPaid: 80000, policyNotes: '全家醫療計劃' },
    { id: 'ins3', provider: '宏利 (Manulife)', type: 'Critical Illness', nature: 'Savings', coverageAmount: 2000000, premium: 3000, premiumFrequency: 'Monthly', beneficiary: '本人', totalPremiumsPaid: 360000, policyNotes: '早期危疾保障' },
    { id: 'ins4', provider: '安盛 (AXA)', type: 'Savings', nature: 'Savings', coverageAmount: 1000000, premium: 2000, premiumFrequency: 'Monthly', beneficiary: '子女', totalPremiumsPaid: 120000, policyNotes: '教育基金' },
  ],
  portfolio: [
    { id: 'p1', ticker: 'AAPL', name: 'Apple Inc.', shares: 500, avgPrice: 150, currentPrice: 185, allocation: 25, sector: 'Information Technology' },
    { id: 'p2', ticker: 'MSFT', name: 'Microsoft Corp', shares: 300, avgPrice: 280, currentPrice: 330, allocation: 25, sector: 'Information Technology' },
    { id: 'p3', ticker: '0005.HK', name: 'HSBC Holdings', shares: 4000, avgPrice: 45, currentPrice: 62, allocation: 15, sector: 'Financials' },
    { id: 'p4', ticker: '0700.HK', name: 'Tencent', shares: 600, avgPrice: 320, currentPrice: 360, allocation: 20, sector: 'Communication Services' },
    { id: 'p5', ticker: '2800.HK', name: 'Tracker Fund', shares: 5000, avgPrice: 18, currentPrice: 19.5, allocation: 15, sector: 'ETF' },
  ]
};

export const COLORS = ['#45d3c7', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

export const SECTOR_OPTIONS = [
  'Information Technology',
  'Financials',
  'Health Care',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Materials',
  'Industrials',
  'Utilities',
  'Real Estate',
  'Communication Services',
  'ETF',
  'Cryptocurrency',
  'Other'
];
