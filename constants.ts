
import { ClientProfile, AssetType, LiabilityType } from './types';

// Real Data for HK Private Hospital Charges (Based on actual FWD Claim Settlements)
export const HK_MEDICAL_PROCEDURES = [
  {
    id: 'proc_real_1',
    name: '意外牙科治療 - 崩牙 (Emergency Dental)',
    category: 'Accident',
    days: 0, // Outpatient
    costRoom: 0,
    costSurgeon: 10280, // Emergency dental treatment fee
    costAnaesthetist: 0,
    costOT: 0,
    costMisc: 0,
    costSpecialist: 0,
    total: 10280
  },
  {
    id: 'proc_real_2',
    name: '脫疣手術 (Wart Removal) - 日間手術',
    category: 'Minor Surgery',
    days: 0, // Day Case
    costRoom: 0,
    costSurgeon: 12000,
    costAnaesthetist: 0,
    costOT: 3000,
    costMisc: 3800, // Misc + Pre-hospitalization
    costSpecialist: 500, // Cash benefit offset or admin
    total: 19300
  },
  {
    id: 'proc_real_3',
    name: '兒童嚴重支氣管炎 (Bronchitis) - 私家房',
    category: 'Inpatient (Medical)',
    days: 3,
    costRoom: 3200,
    costSurgeon: 0, // Medical case, no surgeon
    costAnaesthetist: 0,
    costOT: 0,
    costMisc: 24107, // Misc + Hospital Income
    costSpecialist: 5750, // Physician + Specialist fees
    total: 33057
  },
  {
    id: 'proc_real_4',
    name: '割雞眼手術 (Corn Removal)',
    category: 'Common Surgery',
    days: 1,
    costRoom: 0, // Day case or minor
    costSurgeon: 18000,
    costAnaesthetist: 3000,
    costOT: 4000,
    costMisc: 4000,
    costSpecialist: 0,
    total: 29000
  },
  {
    id: 'proc_real_5',
    name: '腎石移除 (Kidney Stone) - 私家房',
    category: 'Major Surgery',
    days: 3,
    costRoom: 5000,
    costSurgeon: 42000,
    costAnaesthetist: 14000,
    costOT: 15728,
    costMisc: 20660, // Misc + Pre-hosp
    costSpecialist: 3000, // Physician
    total: 100388
  },
  {
    id: 'proc_real_6',
    name: '靜脈曲張手術 (Varicose Veins) - 中大醫院',
    category: 'Major Surgery',
    days: 1, // Day Case / Short stay
    costRoom: 810,
    costSurgeon: 50000,
    costAnaesthetist: 15000,
    costOT: 6001,
    costMisc: 39919, // Misc + Post-OPD + Pre-hosp
    costSpecialist: 1200,
    total: 112930
  },
  {
    id: 'proc_real_7',
    name: '癌症非手術治療 (Cancer Treatment)',
    category: 'Critical Illness',
    days: 0, // Long term
    costRoom: 0,
    costSurgeon: 0,
    costAnaesthetist: 0,
    costOT: 0,
    costMisc: 217500, // Non-surgical treatments + Imaging
    costSpecialist: 35500, // Consultations
    total: 253000
  },
  {
    id: 'proc_real_8',
    name: '肺炎治療 (Pneumonia) - 住院3晚',
    category: 'Inpatient (Medical/Procedure)',
    days: 3,
    costRoom: 4254,
    costSurgeon: 12000,
    costAnaesthetist: 4000,
    costOT: 3720,
    costMisc: 38970, // Misc (34243) + Pre-hosp (2377) + Imaging (2350)
    costSpecialist: 3900,
    total: 66844
  },
  {
    id: 'proc_real_9',
    name: '朱古力瘤切除 (Endometrioma) - 住院1晚',
    category: 'Major Surgery',
    days: 1,
    costRoom: 1480,
    costSurgeon: 50000,
    costAnaesthetist: 13000,
    costOT: 11320,
    costMisc: 18368,
    costSpecialist: 1600, // Attending Doctor
    total: 95768
  }
];

export const MOCK_CLIENT: ClientProfile = {
  id: 'c-001',
  name: '陳大文 (Alex Chan)',
  email: 'alex.chan@example.com',
  phone: '+852 9123 4567',
  notes: '高淨值客戶，專注於提早退休及資產傳承規劃。',
  lastMeetingDate: '2024-02-15',
  lastUpdated: new Date().toISOString(),
  dateOfBirth: '1982-05-15', // Approx 42 years old
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
    { 
      id: 'ins1', 
      name: '守護健康危疾加倍保', 
      provider: '保誠 (Prudential)', 
      type: 'Life', 
      nature: 'Consumption', 
      coverageAmount: 5000000, 
      premium: 2500, 
      premiumFrequency: 'Monthly', 
      beneficiary: '配偶', 
      totalPremiumsPaid: 150000, 
      policyNotes: '人壽主約',
      riders: [
        { id: 'r1', name: '定期人壽附加保障', coverageAmount: 2000000, premium: 500 },
        { id: 'r2', name: '意外受傷附加保障', coverageAmount: 500000, premium: 200 }
      ]
    },
    { id: 'ins2', name: 'CEO 高端醫療計劃', provider: '友邦 (AIA)', type: 'Medical', nature: 'Consumption', coverageAmount: 0, premium: 1500, premiumFrequency: 'Monthly', beneficiary: '家庭', totalPremiumsPaid: 80000, policyNotes: '全家醫療計劃' },
    { id: 'ins3', name: '活耀人生危疾保', provider: '宏利 (Manulife)', type: 'Critical Illness', nature: 'Savings', coverageAmount: 2000000, premium: 3000, premiumFrequency: 'Monthly', beneficiary: '本人', totalPremiumsPaid: 360000, policyNotes: '早期危疾保障' },
    { id: 'ins4', name: '真智珍寶儲蓄', provider: '安盛 (AXA)', type: 'Savings', nature: 'Savings', coverageAmount: 1000000, premium: 2000, premiumFrequency: 'Monthly', beneficiary: '子女', totalPremiumsPaid: 120000, policyNotes: '教育基金' },
  ],
  portfolio: [
    { id: 'p1', ticker: 'AAPL', name: 'Apple Inc.', shares: 500, avgPrice: 150, currentPrice: 185, allocation: 25, sector: 'Information Technology' },
    { id: 'p2', ticker: 'MSFT', name: 'Microsoft Corp', shares: 300, avgPrice: 280, currentPrice: 330, allocation: 25, sector: 'Information Technology' },
    { id: 'p3', ticker: '0005.HK', name: 'HSBC Holdings', shares: 4000, avgPrice: 45, currentPrice: 62, allocation: 15, sector: 'Financials' },
    { id: 'p4', ticker: '0700.HK', name: 'Tencent', shares: 600, avgPrice: 320, currentPrice: 360, allocation: 20, sector: 'Communication Services' },
    { id: 'p5', ticker: '2800.HK', name: 'Tracker Fund', shares: 5000, avgPrice: 18, currentPrice: 19.5, allocation: 15, sector: 'ETF' },
  ],
  medicalPlans: [
    {
      id: 'mp1',
      name: '公司團體醫療 (Basic)',
      type: 'Group',
      deductible: 0,
      roomType: 'Ward',
      limitRoomAndBoard: 800, // low daily limit
      limitSurgical: 30000,
      limitAnaesthetist: 10000,
      limitOperatingTheatre: 10000,
      limitMiscServices: 10000,
      limitSpecialist: 1000,
      overallAnnualLimit: 0,
      fullCover: false
    },
    {
      id: 'mp2',
      name: '個人高端醫療 (Top-up)',
      type: 'Personal',
      deductible: 20000, // High deductible
      roomType: 'Semi-Private',
      limitRoomAndBoard: 3000,
      limitSurgical: 100000,
      limitAnaesthetist: 30000,
      limitOperatingTheatre: 30000,
      limitMiscServices: 50000,
      limitSpecialist: 3000,
      overallAnnualLimit: 8000000,
      fullCover: true // Semi-private fully covered subject to deductible
    }
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

export const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
