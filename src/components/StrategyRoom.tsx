import { useState } from 'react';
import { Target, GraduationCap, TrendingUp, Settings, Lightbulb, Brain, Send, Loader2, User, Bot } from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={28} />,
  TrendingUp: <TrendingUp size={28} />,
  Settings: <Settings size={28} />,
  Lightbulb: <Lightbulb size={28} />,
};

const pillarColors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function StrategyRoom() {
  const { state } = useApp();
  const { strategyPillars } = state;
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    if (!state.geminiApiKey) {
      setChatMessages(prev => [...prev, { role: 'user', content: chatInput }, { role: 'assistant', content: 'יש להגדיר מפתח Gemini API בלוח הבקרה' }]);
      setChatInput('');
      return;
    }

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: state.geminiApiKey });

      const context = `אתה יועץ אסטרטגי עבור מכללת AI בישראל בשם "FD AI College".
הנה העמודים האסטרטגיים של הארגון:
${strategyPillars.map(p => `- ${p.title}: ${p.description}`).join('\n')}

נתוני הארגון:
- ${state.courseInstances.length} קורסים פעילים
- ${state.courseInstances.flatMap(c => c.registeredStudents).length} סטודנטים
- ${state.teamMembers.length} חברי צוות
ענה בעברית.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `${context}\n\nשאלת המשתמש: ${userMsg}`,
      });

      setChatMessages(prev => [...prev, { role: 'assistant', content: response.text || 'לא התקבלה תשובה' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `שגיאה: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-900">חדר אסטרטגיה</h2>

      {/* Strategy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategyPillars.map((pillar, i) => (
          <div key={pillar.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`${pillarColors[i % pillarColors.length]} text-white p-5`}>
              <div className="flex items-center gap-3">
                {iconMap[pillar.icon] || <Target size={28} />}
                <h3 className="text-xl font-bold">{pillar.title}</h3>
              </div>
              <p className="text-sm mt-2 opacity-90">{pillar.description}</p>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">יעדים</h4>
                <ul className="space-y-1">
                  {pillar.objectives.map(obj => (
                    <li key={obj} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">KPIs</h4>
                <div className="flex flex-wrap gap-2">
                  {pillar.kpis.map(kpi => (
                    <span key={kpi} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{kpi}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Strategic Advisor Chat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-brand-50">
          <Brain size={20} className="text-brand-600" />
          <h3 className="text-lg font-semibold text-brand-800">יועץ אסטרטגי AI</h3>
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Brain size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">שאל שאלות אסטרטגיות על העסק שלך</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['איך להגדיל את ההכנסות?', 'מה היתרון התחרותי שלנו?', 'אסטרטגיית כניסה ל-B2B'].map(q => (
                  <button key={q} onClick={() => { setChatInput(q); }} className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-brand-600" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed
                ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                  <User size={14} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                <Bot size={14} className="text-brand-600" />
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-2.5">
                <Loader2 size={16} className="animate-spin text-brand-600" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="שאל שאלה אסטרטגית..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
