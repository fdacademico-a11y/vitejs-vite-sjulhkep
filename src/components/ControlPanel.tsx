import { useState } from 'react';
import { Download, Upload, RefreshCw, Key, Globe, Database, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppState } from '../types';

export default function ControlPanel() {
  const { state, dispatch } = useApp();
  const [importText, setImportText] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const exportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fd-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('הנתונים יוצאו בהצלחה');
    setTimeout(() => setMessage(''), 3000);
  };

  const importData = () => {
    try {
      const data = JSON.parse(importText) as AppState;
      if (!data.teamMembers || !data.tasks || !data.courseInstances) {
        throw new Error('מבנה נתונים לא תקין');
      }
      dispatch({ type: 'IMPORT_STATE', payload: data });
      setImportText('');
      setMessage('הנתונים יובאו בהצלחה');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`שגיאה בייבוא: ${err instanceof Error ? err.message : 'JSON לא תקין'}`);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportText(ev.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (confirm('האם אתה בטוח? כל הנתונים יאופסו למצב ברירת המחדל.')) {
      dispatch({ type: 'RESET_STATE' });
      setMessage('הנתונים אופסו בהצלחה');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const syncToCloud = async () => {
    if (!state.cloudSyncUrl) {
      setMessage('יש להגדיר כתובת סנכרון');
      return;
    }
    setSyncStatus('syncing');
    try {
      const response = await fetch(state.cloudSyncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (response.ok) {
        setSyncStatus('success');
        setMessage('הנתונים סונכרנו בהצלחה');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      setSyncStatus('error');
      setMessage(`שגיאת סנכרון: ${err instanceof Error ? err.message : 'שגיאה'}`);
    }
    setTimeout(() => { setSyncStatus('idle'); setMessage(''); }, 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-900">לוח בקרה - Admin</h2>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.includes('שגיאה') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.includes('שגיאה') ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini API Key */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={20} className="text-brand-600" />
            <h3 className="text-lg font-semibold">מפתח Gemini API</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">נדרש עבור יועץ CFO ויועץ אסטרטגי</p>
          <input
            type="password"
            value={state.geminiApiKey}
            onChange={e => dispatch({ type: 'SET_GEMINI_KEY', payload: e.target.value })}
            placeholder="AIzaSy..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Cloud Sync */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-brand-600" />
            <h3 className="text-lg font-semibold">סנכרון ענן</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">כתובת Google Apps Script Web App</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={state.cloudSyncUrl}
              onChange={e => dispatch({ type: 'SET_CLOUD_SYNC_URL', payload: e.target.value })}
              placeholder="https://script.google.com/macros/s/..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button onClick={syncToCloud} disabled={syncStatus === 'syncing'}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
              סנכרן
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Download size={20} className="text-brand-600" />
            <h3 className="text-lg font-semibold">ייצוא נתונים</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">הורד גיבוי JSON של כל הנתונים</p>
          <button onClick={exportData}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <Download size={16} /> הורד גיבוי JSON
          </button>
        </div>

        {/* Import */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={20} className="text-brand-600" />
            <h3 className="text-lg font-semibold">ייבוא נתונים</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">העלה קובץ JSON או הדבק תוכן</p>
          <div className="space-y-2">
            <input type="file" accept=".json" onChange={handleFileImport}
              className="w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder='{"teamMembers": [...], "tasks": [...], ...}'
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={4}
            />
            <button onClick={importData} disabled={!importText}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <Upload size={16} /> ייבא נתונים
            </button>
          </div>
        </div>
      </div>

      {/* Data Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} className="text-brand-600" />
          <h3 className="text-lg font-semibold">סיכום נתונים</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'חברי צוות', value: state.teamMembers.length },
            { label: 'משימות', value: state.tasks.length },
            { label: 'תבניות קורסים', value: state.courseTemplates.length },
            { label: 'קורסים פעילים', value: state.courseInstances.length },
            { label: 'סטודנטים', value: state.courseInstances.flatMap(c => c.registeredStudents).length },
            { label: 'שלבי Playbook', value: state.playbookSteps.length },
          ].map(item => (
            <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-brand-700">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle size={20} /> אזור מסוכן
            </h3>
            <p className="text-sm text-red-600 mt-1">איפוס כל הנתונים לערכי ברירת מחדל</p>
          </div>
          <button onClick={resetData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Trash2 size={16} /> אפס נתונים
          </button>
        </div>
      </div>
    </div>
  );
}
