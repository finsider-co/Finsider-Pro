export enum AssetType {
  CASH = '現金及等價物',
  EQUITY = '股票',
  FIXED_INCOME = '固定收益',
  REAL_ESTATE = '房地產',
  ALTERNATIVE = '另類投資'
}

export enum LiabilityType {
  MORTGAGE = '按揭',
  LOAN = '私人貸款',
  CREDIT_CARD = '信用卡',
  OTHER = '其他'
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  currency: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  amount: number;
  interestRate: number;
  monthlyPayment: number;
}

export interface CashFlowItem {
  id: string;
  category: string;
  amount: number;
  frequency: 'Monthly' | 'Annually';
  isIncome: boolean;
}

export type InsuranceType = 'Life' | 'Health' | 'Critical Illness' | 'Disability' | 'Savings' | 'Annuity';
export type PolicyNature = 'Savings' | 'Consumption';

export interface InsurancePolicy {
  id: string;
  provider: string;
  type: InsuranceType;
  nature: PolicyNature;
  coverageAmount: number;
  premium: number;
  premiumFrequency: 'Monthly' | 'Annually';
  beneficiary: string;
  totalPremiumsPaid?: number; // New field
  policyNotes?: string; // New field
  expiryDate?: string;
}

export interface InvestmentHolding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  lastPriceCheck?: string; // New field for update timestamp
  allocation: number; // percentage
  sector: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  lastMeetingDate?: string; // New field
  lastUpdated?: string;
  age: number;
  retirementAge: number;
  assets: Asset[];
  liabilities: Liability[];
  cashFlow: CashFlowItem[];
  insurance: InsurancePolicy[];
  portfolio: InvestmentHolding[];
}

export type ViewState = 'DASHBOARD' | 'CASHFLOW' | 'NETWORTH' | 'PORTFOLIO' | 'INSURANCE' | 'EDITOR';
