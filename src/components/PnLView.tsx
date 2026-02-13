import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, BarChart3, Brain, Loader2, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import type { FinancialKPIs } from '../types';

export default function PnLView() {
  const { state } = useApp();
  const { monthlyFinancials, courseInstances } = state;
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // P&L calculations
  const pnlData = monthlyFinancials.map(m => {
    const totalExpenses = m.instructorCosts + m.marketingCosts + m.operationalCosts + m.platformCosts + m.otherCosts;
    return { ...m, totalExpenses, profit: m.revenue - totalExpenses, margin: m.revenue > 0 ? ((m.revenue - totalExpenses) / m.revenue * 100) : 0 };
  });

  const totals = pnlData.reduce((acc, m) => ({
    revenue: acc.revenue + m.revenue,
    instructorCosts: acc.instructorCosts + m.instructorCosts,
    marketingCosts: acc.marketingCosts + m.marketingCosts,
    operationalCosts: acc.operationalCosts + m.operationalCosts,
    platformCosts: acc.platformCosts + m.platformCosts,
    otherCosts: acc.otherCosts + m.otherCosts,
    totalExpenses: acc.totalExpenses + m.totalExpenses,
    profit: acc.profit + m.profit,
  }), { revenue: 0, instructorCosts: 0, marketingCosts: 0, operationalCosts: 0, platformCosts: 0, otherCosts: 0, totalExpenses: 0, profit: 0 });

  // KPIs
  const allStudents = courseInstances.flatMap(c => c.registeredStudents);
  const totalStudents = allStudents.length;
  const totalCapacity = courseInstances.reduce((s, c) => s + c.maxStudents, 0);

  const kpis: FinancialKPIs = {
    cac: totalStudents > 0 ? Math.round(totals.marketingCosts / totalStudents) : 0,
    ltv: totalStudents > 0 ? Math.round(totals.revenue / totalStudents) : 0,
    occupancyRate: totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0,
    profitMargin: totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0,
    revenuePerStudent: totalStudents > 0 ? Math.round(totals.revenue / totalStudents) : 0,
    avgCourseRevenue: courseInstances.length > 0 ? Math.round(totals.revenue / courseInstances.length) : 0,
  };

  const kpiCards = [
    { label: 'CAC (עלות רכישה)', value: `₪${kpis.cac}`, icon: <DollarSign size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'LTV (ערך לקוח)', value: `₪${kpis.ltv}`, icon: <TrendingUp size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'תפוסה', value: `${kpis.occupancyRate}%`, icon: <Users size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'מרווח רווח', value: `${kpis.profitMargin}%`, icon: <Percent size={20} />, color: kpis.profitMargin > 0 ? 'text-green-600' : 'text-red-600', bg: kpis.profitMargin > 0 ? 'bg-green-50' : 'bg-red-50' },
    { label: 'הכנסה/סטודנט', value: `₪${kpis.revenuePerStudent}`, icon: <BarChart3 size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'הכנסה ממוצעת/קורס', value: `₪${kpis.avgCourseRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  // Chart data
  const chartData = pnlData.map(m => ({
    name: m.month,
    'הכנסות': m.revenue,
    'הוצאות': m.totalExpenses,
    'רווח': m.profit,
  }));

  const askAiCfo = async () => {
    if (!state.geminiApiKey) {
      setAiError('יש להגדיר מפתח Gemini API בלוח הבקרה');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: state.geminiApiKey });
      const financialSummary = JSON.stringify({ totals, kpis, monthlyData: pnlData }, null, 2);
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `אתה יועץ פיננסי (CFO) של מכללת AI בישראל. הנה הנתונים הפיננסיים:\n${financialSummary}\n\nתן 5 המלצות ספציפיות לאופטימיזציה פיננסית, מותאמות לשוק הישראלי. כתוב בעברית.`,
      });
      setAiAdvice(response.text || 'לא התקבלה תשובה');
    } catch (err) {
      setAiError(`שגיאה: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-900">כספים ודוח רווח והפסד</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`${kpi.bg} ${kpi.color} p-2 rounded-lg w-fit mb-2`}>{kpi.icon}</div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">סיכום חודשי</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number | undefined) => v != null ? `₪${v.toLocaleString()}` : ''} />
            <Legend />
            <Bar dataKey="הכנסות" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="הוצאות" fill="#ef4444" radius={[2, 2, 0, 0]} />
            <Bar dataKey="רווח" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* P&L Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <h3 className="text-lg font-semibold p-4 border-b border-gray-100">דוח רווח והפסד</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-right py-3 px-4 font-semibold text-gray-600">סעיף</th>
              {pnlData.map(m => <th key={m.month} className="text-center py-3 px-3 font-semibold text-gray-600">{m.month}</th>)}
              <th className="text-center py-3 px-4 font-bold text-gray-800 bg-gray-100">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 bg-green-50/50 font-semibold">
              <td className="py-3 px-4 text-green-700">הכנסות</td>
              {pnlData.map(m => <td key={m.month} className="text-center py-3 px-3 text-green-700">₪{m.revenue.toLocaleString()}</td>)}
              <td className="text-center py-3 px-4 font-bold text-green-800 bg-green-100/50">₪{totals.revenue.toLocaleString()}</td>
            </tr>
            {[
              { key: 'instructorCosts', label: 'עלויות מרצים' },
              { key: 'marketingCosts', label: 'שיווק' },
              { key: 'operationalCosts', label: 'תפעול' },
              { key: 'platformCosts', label: 'פלטפורמות' },
              { key: 'otherCosts', label: 'אחר' },
            ].map(row => (
              <tr key={row.key} className="border-b border-gray-50">
                <td className="py-2 px-4 text-red-600">{row.label}</td>
                {pnlData.map(m => <td key={m.month} className="text-center py-2 px-3 text-red-500">₪{(m[row.key as keyof typeof m] as number).toLocaleString()}</td>)}
                <td className="text-center py-2 px-4 text-red-600 bg-gray-50">₪{totals[row.key as keyof typeof totals].toLocaleString()}</td>
              </tr>
            ))}
            <tr className="border-b border-gray-50 bg-red-50/50 font-semibold">
              <td className="py-3 px-4 text-red-700">סה"כ הוצאות</td>
              {pnlData.map(m => <td key={m.month} className="text-center py-3 px-3 text-red-700">₪{m.totalExpenses.toLocaleString()}</td>)}
              <td className="text-center py-3 px-4 font-bold text-red-800 bg-red-100/50">₪{totals.totalExpenses.toLocaleString()}</td>
            </tr>
            <tr className="bg-blue-50/50 font-bold text-lg">
              <td className="py-3 px-4 text-brand-800">רווח נקי</td>
              {pnlData.map(m => (
                <td key={m.month} className={`text-center py-3 px-3 ${m.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {m.profit >= 0 ? <TrendingUp size={14} className="inline ml-1" /> : <TrendingDown size={14} className="inline ml-1" />}
                  ₪{m.profit.toLocaleString()}
                </td>
              ))}
              <td className={`text-center py-3 px-4 font-bold bg-blue-100/50 ${totals.profit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                ₪{totals.profit.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* AI CFO Advisor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={24} className="text-brand-600" />
            <h3 className="text-lg font-semibold">יועץ CFO - AI</h3>
          </div>
          <button onClick={askAiCfo} disabled={aiLoading}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {aiLoading ? 'מנתח...' : 'קבל ייעוץ פיננסי'}
          </button>
        </div>
        {aiError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{aiError}</p>}
        {aiAdvice && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">{aiAdvice}</div>
        )}
        {!aiAdvice && !aiError && (
          <p className="text-sm text-gray-400 text-center py-4">לחץ על "קבל ייעוץ פיננסי" כדי לקבל המלצות AI מותאמות לנתונים שלך</p>
        )}
      </div>
    </div>
  );
}
