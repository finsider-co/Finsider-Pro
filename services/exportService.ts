import { ClientProfile } from "../types";

export const exportClientToCSV = (client: ClientProfile) => {
  // BOM for UTF-8 in Excel
  const BOM = "\uFEFF";
  let csvContent = "data:text/csv;charset=utf-8," + BOM;

  // Helper to escape commas
  const safe = (str: string | number | undefined) => `"${String(str || '').replace(/"/g, '""')}"`;

  // 1. Profile Section
  csvContent += "CLIENT PROFILE\n";
  csvContent += "ID,Name,Age,Email,Phone,Retirement Age,Last Meeting,Notes\n";
  csvContent += `${safe(client.id)},${safe(client.name)},${safe(client.age)},${safe(client.email)},${safe(client.phone)},${safe(client.retirementAge)},${safe(client.lastMeetingDate)},${safe(client.notes)}\n\n`;

  // 2. Assets
  csvContent += "ASSETS\n";
  csvContent += "Name,Type,Value,Currency\n";
  client.assets.forEach(a => {
    csvContent += `${safe(a.name)},${safe(a.type)},${a.value},${safe(a.currency)}\n`;
  });
  csvContent += "\n";

  // 3. Liabilities
  csvContent += "LIABILITIES\n";
  csvContent += "Name,Type,Amount,Interest Rate (%),Monthly Payment\n";
  client.liabilities.forEach(l => {
    csvContent += `${safe(l.name)},${safe(l.type)},${l.amount},${l.interestRate},${l.monthlyPayment}\n`;
  });
  csvContent += "\n";

  // 4. Portfolio
  csvContent += "PORTFOLIO HOLDINGS\n";
  csvContent += "Ticker,Name,Sector,Shares,Avg Price,Current Price,Market Value,Allocation (%)\n";
  client.portfolio.forEach(p => {
    const marketValue = p.shares * p.currentPrice;
    csvContent += `${safe(p.ticker)},${safe(p.name)},${safe(p.sector)},${p.shares},${p.avgPrice},${p.currentPrice},${marketValue},${p.allocation}\n`;
  });
  csvContent += "\n";

  // 5. Insurance
  csvContent += "INSURANCE POLICIES\n";
  csvContent += "Provider,Type,Nature,Coverage Amount,Premium,Frequency,Beneficiary,Notes\n";
  client.insurance.forEach(i => {
    csvContent += `${safe(i.provider)},${safe(i.type)},${safe(i.nature)},${i.coverageAmount},${i.premium},${safe(i.premiumFrequency)},${safe(i.beneficiary)},${safe(i.policyNotes)}\n`;
  });
  csvContent += "\n";

  // 6. Cash Flow
  csvContent += "CASH FLOW\n";
  csvContent += "Category,Type,Amount,Frequency\n";
  client.cashFlow.forEach(c => {
    csvContent += `${safe(c.category)},${c.isIncome ? 'Income' : 'Expense'},${c.amount},${safe(c.frequency)}\n`;
  });

  // Trigger Download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  const filename = `FinsiderReport_${client.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
