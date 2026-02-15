
import { ClientProfile } from "../types";
import * as XLSX from 'xlsx';
import { calculateAge } from "../constants";

// Helper for formatting currency
const currency = (val: number) => val; 

export const exportClientToExcel = (client: ClientProfile) => {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Overview ---
  const age = calculateAge(client.dateOfBirth);
  
  // Calculate Totals
  const portfolioValue = client.portfolio.reduce((sum, p) => sum + (p.shares * p.currentPrice), 0);
  const manualAssets = client.assets.reduce((sum, a) => sum + a.value, 0);
  const totalAssets = manualAssets + portfolioValue;
  const totalLiabilities = client.liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlyIncome = client.cashFlow.filter(c => c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);
  const monthlyExpense = client.cashFlow.filter(c => !c.isIncome).reduce((sum, c) => sum + (c.frequency === 'Monthly' ? c.amount : c.amount/12), 0);

  const overviewData = [
    ["CLIENT PROFILE REPORT"],
    [],
    ["Name", client.name],
    ["ID", client.id],
    ["Date of Birth", client.dateOfBirth],
    ["Age", age],
    ["Phone", client.phone],
    ["Email", client.email],
    ["Retirement Age", client.retirementAge],
    ["Last Meeting", client.lastMeetingDate],
    ["Notes", client.notes],
    [],
    ["FINANCIAL SUMMARY"],
    ["Net Worth", netWorth],
    ["Total Assets", totalAssets],
    ["Total Liabilities", totalLiabilities],
    ["Monthly Income", monthlyIncome],
    ["Monthly Expenses", monthlyExpense],
    ["Monthly Savings", monthlyIncome - monthlyExpense]
  ];
  
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");

  // --- Sheet 2: Assets & Portfolio ---
  const assetRows: any[] = [
    ["ASSETS (Manual)"],
    ["Name", "Type", "Value", "Currency"]
  ];
  client.assets.forEach(a => assetRows.push([a.name, a.type, a.value, a.currency]));
  assetRows.push([]);
  
  assetRows.push(["INVESTMENT PORTFOLIO"]);
  assetRows.push(["Ticker", "Name", "Sector", "Shares", "Current Price", "Market Value", "Allocation %"]);
  client.portfolio.forEach(p => {
    assetRows.push([p.ticker, p.name, p.sector, p.shares, p.currentPrice, p.shares * p.currentPrice, p.allocation]);
  });
  
  const wsAssets = XLSX.utils.aoa_to_sheet(assetRows);
  XLSX.utils.book_append_sheet(wb, wsAssets, "Assets & Portfolio");

  // --- Sheet 3: Liabilities ---
  const liabilityRows: any[] = [["Name", "Type", "Amount", "Interest Rate %", "Monthly Payment"]];
  client.liabilities.forEach(l => liabilityRows.push([l.name, l.type, l.amount, l.interestRate, l.monthlyPayment]));
  const wsLiabilities = XLSX.utils.aoa_to_sheet(liabilityRows);
  XLSX.utils.book_append_sheet(wb, wsLiabilities, "Liabilities");

  // --- Sheet 4: Insurance ---
  const insuranceRows: any[] = [["Provider", "Plan Name", "Type", "Nature", "Coverage", "Premium", "Frequency", "Beneficiary", "Total Paid", "Notes", "Riders Info"]];
  client.insurance.forEach(i => {
    // Format riders string
    const ridersStr = (i.riders || []).map(r => `${r.name} ($${r.coverageAmount})`).join('; ');
    insuranceRows.push([i.provider, i.name, i.type, i.nature, i.coverageAmount, i.premium, i.premiumFrequency, i.beneficiary, i.totalPremiumsPaid, i.policyNotes, ridersStr]);
  });
  const wsInsurance = XLSX.utils.aoa_to_sheet(insuranceRows);
  XLSX.utils.book_append_sheet(wb, wsInsurance, "Insurance");

  // --- Sheet 5: Cash Flow ---
  const cfRows: any[] = [["Category", "Type", "Amount", "Frequency"]];
  client.cashFlow.forEach(c => cfRows.push([c.category, c.isIncome ? 'Income' : 'Expense', c.amount, c.frequency]));
  const wsCashFlow = XLSX.utils.aoa_to_sheet(cfRows);
  XLSX.utils.book_append_sheet(wb, wsCashFlow, "Cash Flow");

  // Write File
  const safeName = client.name.replace(/[^a-z0-9]/gi, '_').substring(0,20);
  XLSX.writeFile(wb, `Report_${safeName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportAllClientsToExcel = (clients: ClientProfile[]) => {
  const wb = XLSX.utils.book_new();

  clients.forEach(client => {
    const age = calculateAge(client.dateOfBirth);
    const sheetData: any[][] = [];

    // --- 1. Header & Profile ---
    sheetData.push([`CLIENT REPORT: ${client.name} (${client.id})`]);
    sheetData.push(["Generated on:", new Date().toISOString().split('T')[0]]);
    sheetData.push([]);

    sheetData.push(["PROFILE"]);
    sheetData.push(["ID", "Name", "Date of Birth", "Age", "Email", "Phone", "Retirement Age", "Last Meeting", "Notes"]);
    sheetData.push([client.id, client.name, client.dateOfBirth, age, client.email, client.phone, client.retirementAge, client.lastMeetingDate, client.notes]);
    sheetData.push([]);

    // --- 2. Assets ---
    sheetData.push(["ASSETS"]);
    sheetData.push(["Name", "Type", "Value", "Currency"]);
    client.assets.forEach(a => {
      sheetData.push([a.name, a.type, a.value, a.currency]);
    });
    // Asset Sum
    const totalAssets = client.assets.reduce((sum, a) => sum + a.value, 0) + 
                        client.portfolio.reduce((sum, p) => sum + (p.shares * p.currentPrice), 0);
    sheetData.push(["Total Assets (Est. with Portfolio)", "", totalAssets]);
    sheetData.push([]);

    // --- 3. Liabilities ---
    sheetData.push(["LIABILITIES"]);
    sheetData.push(["Name", "Type", "Amount", "Interest Rate (%)", "Monthly Payment"]);
    client.liabilities.forEach(l => {
      sheetData.push([l.name, l.type, l.amount, l.interestRate, l.monthlyPayment]);
    });
    sheetData.push([]);

    // --- 4. Portfolio ---
    sheetData.push(["PORTFOLIO"]);
    sheetData.push(["Ticker", "Name", "Sector", "Shares", "Avg Price", "Current Price", "Market Value", "Allocation (%)"]);
    client.portfolio.forEach(p => {
       sheetData.push([p.ticker, p.name, p.sector, p.shares, p.avgPrice, p.currentPrice, p.shares * p.currentPrice, p.allocation]);
    });
    sheetData.push([]);

    // --- 5. Insurance ---
    sheetData.push(["INSURANCE"]);
    sheetData.push(["Provider", "Plan Name", "Type", "Nature", "Coverage", "Premium", "Frequency", "Beneficiary", "Notes", "Riders"]);
    client.insurance.forEach(i => {
      const ridersStr = (i.riders || []).map(r => `${r.name} ($${r.coverageAmount})`).join('; ');
      sheetData.push([i.provider, i.name, i.type, i.nature, i.coverageAmount, i.premium, i.premiumFrequency, i.beneficiary, i.policyNotes, ridersStr]);
    });
    sheetData.push([]);

    // --- 6. Cash Flow ---
    sheetData.push(["CASH FLOW"]);
    sheetData.push(["Category", "Type", "Amount", "Frequency"]);
    client.cashFlow.forEach(c => {
      sheetData.push([c.category, c.isIncome ? 'Income' : 'Expense', c.amount, c.frequency]);
    });

    // Create Worksheet
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Sanitize sheet name
    let safeName = client.name.replace(/[\[\]\*\/\\\?:]/g, '').trim();
    if (safeName.length > 20) safeName = safeName.substring(0, 20);
    safeName = `${safeName} (${client.id})`;
    
    if (!safeName || safeName.length === 0) safeName = client.id;

    let finalSheetName = safeName;
    let counter = 1;
    while(wb.SheetNames.includes(finalSheetName)) {
        finalSheetName = `${safeName}_${counter}`;
        counter++;
    }

    XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
  });

  // Export File
  XLSX.writeFile(wb, `Finsider_DB_Full_${new Date().toISOString().split('T')[0]}.xlsx`);
};
