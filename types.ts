
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

// Changed 'Health' to 'Medical'
export type InsuranceType = 'Life' | 'Medical' | 'Critical Illness' | 'Disability' | 'Savings' | 'Annuity';
export type PolicyNature = 'Savings' | 'Consumption';

export interface InsuranceRider {
  id: string;
  name: string; // 附約名稱
  coverageAmount: number; // 附約保額
  premium: number; // 附約保費
}

export interface InsurancePolicy {
  id: string;
  name: string; // Plan Name (計劃名稱)
  provider: string;
  type: InsuranceType;
  nature: PolicyNature;
  coverageAmount: number;
  premium: number;
  premiumFrequency: 'Monthly' | 'Annually';
  beneficiary: string;
  totalPremiumsPaid?: number;
  policyNotes?: string;
  expiryDate?: string;
  riders?: InsuranceRider[]; // New: List of riders
}

// New Interface for detailed Medical Plan Analysis
export interface MedicalPlanDetails {
  id: string;
  name: string; // e.g., "Company Group Medical", "VHIS Flexi"
  type: 'Group' | 'Personal';
  deductible: number; // 自付費
  roomType: 'Ward' | 'Semi-Private' | 'Private';
  // Benefit Limits (Simplified for analysis)
  limitRoomAndBoard: number; // Daily limit
  limitSurgical: number; // Per disability limit
  limitAnaesthetist: number;
  limitOperatingTheatre: number;
  limitMiscServices: number; // Hospital services
  limitSpecialist: number; // Doctor visits
  overallAnnualLimit: number; // Full cover pool limit if applicable (0 if itemized only)
  fullCover?: boolean; // If true, ignore sub-limits up to annual limit (simplified)
}

export interface InvestmentHolding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  lastPriceCheck?: string;
  allocation: number;
  sector: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  lastMeetingDate?: string;
  lastUpdated?: string;
  dateOfBirth: string;
  retirementAge: number;
  assets: Asset[];
  liabilities: Liability[];
  cashFlow: CashFlowItem[];
  insurance: InsurancePolicy[];
  portfolio: InvestmentHolding[];
  medicalPlans: MedicalPlanDetails[]; // New field
}

// --- Auth & Admin Types ---
export type UserRole = 'ADMIN' | 'ADVISOR';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  username: string;
  email?: string; // Add email for recovery
  password: string; // In a real app, this would be hashed. Stored as plain text for this frontend demo.
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
}

export type ViewState = 'DASHBOARD' | 'CASHFLOW' | 'NETWORTH' | 'PORTFOLIO' | 'INSURANCE' | 'FIRE' | 'EDITOR' | 'ADMIN_SETTINGS';
