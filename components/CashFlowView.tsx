import React from 'react';
import { ClientProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  data: ClientProfile;
}

export const CashFlowView: React.FC<Props> = ({ data }) => {
  const incomeItems = data.cashFlow.filter(item => item.isIncome);
  const expenseItems = data.cashFlow.filter(item => !item.isIncome);

  const totalMonthlyIncome = incomeItems
    .reduce((sum, item) => sum + (item.frequency === 'Monthly' ? item.amount : item.amount / 12), 0);
    
  const totalMonthlyExpense = expenseItems
    .reduce((sum, item) => sum + (item.frequency === 'Monthly' ? item.amount : item.amount / 12), 0);

  const surplus = totalMonthlyIncome - totalMonthlyExpense;

  const chartData = [
    { name: '總收入', amount: totalMonthlyIncome },
    { name: '總支出', amount: totalMonthlyExpense },
    { name: '淨儲蓄', amount: surplus },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-4">
            <ArrowUpCircle className="h-12 w-12 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-500">每月總收入 (Monthly Income)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
          <div className="flex items-center gap-4">
            <ArrowDownCircle className="h-12 w-12 text-red-500" />
            <div>
              <p className="text-sm font-medium text-slate-500">每月總支出 (Monthly Expenses)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalMonthlyExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">%</div>
            <div>
              <p className="text-sm font-medium text-slate-500">儲蓄率 (Savings Rate)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{((surplus / totalMonthlyIncome) * 100).toFixed(1)}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h4 className="text-lg font-bold text-slate-800 mb-6">現金流概覽 (Cash Flow Overview)</h4>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={80} stroke="#64748b" fontSize={14} fontWeight={500} />
                <Tooltip 
                   formatter={(value: number) => `$${value.toLocaleString()}`}
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="amount" fill="#45d3c7" radius={[0, 6, 6, 0]} barSize={50}>
                  {
                    chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#3b82f6'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">支出細項 (Breakdown)</h4>
          <div className="space-y-5">
            {expenseItems.sort((a,b) => b.amount - a.amount).map((item) => (
              <div key={item.id} className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold inline-block text-slate-700">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold inline-block text-slate-700">
                      ${item.amount.toLocaleString()} <span className="text-slate-400 font-normal text-xs">/ {item.frequency === 'Annually' ? '年' : '月'}</span>
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-slate-100">
                  <div 
                    style={{ width: `${(item.frequency === 'Monthly' ? item.amount : item.amount/12) / totalMonthlyExpense * 100}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-400 rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
