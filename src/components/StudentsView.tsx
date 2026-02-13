import { useState, useMemo } from 'react';
import { Search, MessageCircle, Mail, Phone, Filter, Download, Copy, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Student } from '../types';

const paymentLabels: Record<string, string> = {
  paid: 'שולם', partial: 'חלקי', pending: 'ממתין', refunded: 'הוחזר',
};

const paymentColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700', partial: 'bg-yellow-100 text-yellow-700', pending: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-500',
};

export default function StudentsView() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);

  // Aggregate all students
  const allStudents = useMemo(() => {
    const students: (Student & { courseName: string })[] = [];
    state.courseInstances.forEach(course => {
      course.registeredStudents.forEach(s => {
        students.push({ ...s, courseName: course.name });
      });
    });
    return students;
  }, [state.courseInstances]);

  // Filtered students
  const filtered = useMemo(() => {
    return allStudents.filter(s => {
      const matchSearch = !search || s.name.includes(search) || s.email.includes(search) || s.phone.includes(search);
      const matchPayment = filterPayment === 'all' || s.paymentStatus === filterPayment;
      const matchCourse = filterCourse === 'all' || s.courseId === filterCourse;
      return matchSearch && matchPayment && matchCourse;
    });
  }, [allStudents, search, filterPayment, filterCourse]);

  // Bulk actions
  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const sendWhatsAppBulk = () => {
    const text = filtered.map(s => `${s.name}: ${s.phone}`).join('\n');
    copyToClipboard(text, 'whatsapp');
  };

  const sendEmailBulk = () => {
    const mailtoLink = `mailto:${filtered.map(s => s.email).join(',')}`;
    window.open(mailtoLink, '_blank');
  };

  const exportCSV = () => {
    const headers = 'שם,אימייל,טלפון,קורס,תשלום,סכום\n';
    const rows = filtered.map(s => `${s.name},${s.email},${s.phone},${s.courseName},${paymentLabels[s.paymentStatus]},${s.amountPaid}`).join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalPaid = allStudents.filter(s => s.paymentStatus === 'paid').length;
  const totalPending = allStudents.filter(s => s.paymentStatus === 'pending').length;
  const totalRevenue = allStudents.reduce((s, st) => s + st.amountPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-brand-900">סטודנטים ו-CRM</h2>
        <div className="flex items-center gap-2">
          <button onClick={sendWhatsAppBulk} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
            {copied === 'whatsapp' ? <CheckCircle size={16} /> : <MessageCircle size={16} />}
            {copied === 'whatsapp' ? 'הועתק!' : 'WhatsApp לכולם'}
          </button>
          <button onClick={sendEmailBulk} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
            <Mail size={16} /> Email לכולם
          </button>
          <button onClick={exportCSV} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
            <Download size={16} /> ייצוא CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-brand-700">{allStudents.length}</p>
          <p className="text-xs text-gray-500">סה"כ סטודנטים</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">{totalPaid}</p>
          <p className="text-xs text-gray-500">שילמו</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-red-500">{totalPending}</p>
          <p className="text-xs text-gray-500">ממתינים לתשלום</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-brand-600">₪{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500">הכנסות ממשלמים</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="חיפוש לפי שם, אימייל או טלפון..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="all">כל הסטטוסים</option>
            <option value="paid">שולם</option>
            <option value="partial">חלקי</option>
            <option value="pending">ממתין</option>
            <option value="refunded">הוחזר</option>
          </select>
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="all">כל הקורסים</option>
            {state.courseInstances.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-right py-3 px-4 font-semibold text-gray-600">שם</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">אימייל</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">טלפון</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">קורס</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">תשלום</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">סכום</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(student => (
              <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{student.name}</td>
                <td className="py-3 px-4 text-gray-500">{student.email}</td>
                <td className="py-3 px-4 text-gray-500" dir="ltr">{student.phone}</td>
                <td className="py-3 px-4 text-gray-600 text-xs">{student.courseName}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentColors[student.paymentStatus]}`}>
                    {paymentLabels[student.paymentStatus]}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">₪{student.amountPaid.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <a href={`https://wa.me/972${student.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 hover:bg-green-50 rounded text-green-600" title="WhatsApp">
                      <MessageCircle size={14} />
                    </a>
                    <a href={`mailto:${student.email}`} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Email">
                      <Mail size={14} />
                    </a>
                    <a href={`tel:${student.phone}`} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="טלפון">
                      <Phone size={14} />
                    </a>
                    <button onClick={() => copyToClipboard(student.phone, student.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400" title="העתק טלפון">
                      {copied === student.id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400">לא נמצאו סטודנטים</td></tr>
            )}
          </tbody>
        </table>
        <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          מציג {filtered.length} מתוך {allStudents.length} סטודנטים
        </div>
      </div>
    </div>
  );
}
