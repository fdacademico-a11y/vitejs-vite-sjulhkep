import { DollarSign, Users, BookOpen, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { state } = useApp();
  const { courseInstances, monthlyFinancials, teamMembers, tasks } = state;

  // KPIs
  const allStudents = courseInstances.flatMap(c => c.registeredStudents);
  const totalRevenue = monthlyFinancials.reduce((s, m) => s + m.revenue, 0);
  const activeStudents = allStudents.length;
  const atRiskCourses = courseInstances.filter(c => c.status === 'at-risk').length;
  const instructors = teamMembers.filter(m => m.role === 'Instructor');

  // Chart data
  const chartData = monthlyFinancials.map(m => {
    const totalExpenses = m.instructorCosts + m.marketingCosts + m.operationalCosts + m.platformCosts + m.otherCosts;
    return {
      name: m.month,
      revenue: m.revenue,
      expenses: totalExpenses,
      profit: m.revenue - totalExpenses,
    };
  });

  // Resource matrix
  const resourceData = instructors.map(inst => {
    const assignedCourses = courseInstances.filter(c => c.instructorId === inst.id);
    const totalSessions = assignedCourses.reduce((s, c) => s + c.sessionsTotal, 0);
    const totalStudents = assignedCourses.reduce((s, c) => s + c.registeredStudents.length, 0);
    const totalCost = assignedCourses.reduce((s, c) => s + (c.instructorCostPerSession * c.sessionsTotal), 0);
    return { ...inst, courses: assignedCourses.length, totalSessions, totalStudents, totalCost };
  });

  // Task stats
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletion = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const kpis = [
    { label: 'הכנסות מצטברות', value: `₪${(totalRevenue / 1000).toFixed(0)}K`, icon: <DollarSign size={24} />, color: 'bg-green-500', trend: '+18%', up: true },
    { label: 'סטודנטים פעילים', value: activeStudents.toString(), icon: <Users size={24} />, color: 'bg-blue-500', trend: '+12', up: true },
    { label: 'קורסים בסיכון', value: atRiskCourses.toString(), icon: <AlertTriangle size={24} />, color: 'bg-red-500', trend: atRiskCourses > 0 ? 'דורש טיפול' : 'תקין', up: false },
    { label: 'השלמת משימות', value: `${taskCompletion}%`, icon: <BookOpen size={24} />, color: 'bg-purple-500', trend: `${doneTasks}/${tasks.length}`, up: taskCompletion > 50 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-900">דשבורד - תצוגת CEO</h2>
        <span className="text-sm text-gray-500">עדכון אחרון: היום</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`${kpi.color} text-white p-2.5 rounded-lg`}>{kpi.icon}</div>
              <span className={`text-xs font-medium flex items-center gap-1 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Area Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">הכנסות מול הוצאות</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number | undefined) => v != null ? `₪${v.toLocaleString()}` : ''} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="הכנסות" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="expenses" name="הוצאות" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">רווח חודשי</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number | undefined) => v != null ? `₪${v.toLocaleString()}` : ''} />
              <Bar dataKey="profit" name="רווח" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Matrix */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">מטריצת משאבים - מרצים</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-gray-600">מרצה</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">קורסים</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">סה"כ שיעורים</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">סטודנטים</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">עלות מרצה</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">עומס</th>
              </tr>
            </thead>
            <tbody>
              {resourceData.map(r => {
                const load = r.totalSessions > 15 ? 'high' : r.totalSessions > 8 ? 'medium' : 'low';
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{r.name}</td>
                    <td className="py-3 px-4">{r.courses}</td>
                    <td className="py-3 px-4">{r.totalSessions}</td>
                    <td className="py-3 px-4">{r.totalStudents}</td>
                    <td className="py-3 px-4">₪{r.totalCost.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${load === 'high' ? 'bg-red-100 text-red-700' : load === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {load === 'high' ? 'גבוה' : load === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
