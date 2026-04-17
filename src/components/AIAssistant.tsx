import { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type { AIMessage } from '../types';

const SYSTEM_PROMPT = `אתה סוכן תוכן מקצועי לאקדמיה למנהלים. תפקידך לעזור ליצור, לשפר ולארגן תוכן לימודי איכותי בתחומי ניהול ומנהיגות.

יכולות שלך:
- יצירת תיאורי קורסים מרתקים ומקצועיים
- כתיבת תוכן שיעורים מפורט ומובנה
- הצעות לשאלות חידון ותרגילים
- שיפור וסיכום תוכן קיים
- הצעות לסילבוס ומבנה קורס
- כתיבה בעברית ברמה מקצועית גבוהה

עקרונות:
- התוכן מיועד למנהלים ומקצוענים
- שפה עברית נקייה ומקצועית
- תוכן פרקטי ויישומי
- מבנה ברור עם כותרות ונקודות
- הדגמות ממקרי אמת בעולם הניהול`;

interface Props {
  apiKey: string;
}

export function AIAssistant({ apiKey }: Props) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    const updated: AIMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setLoading(true);

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: updated.map((m) => ({ role: m.role, content: m.content })),
      });

      const reply = response.content[0].type === 'text' ? response.content[0].text : '';
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בתקשורת עם ה-AI');
      setMessages(updated);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const SUGGESTIONS = [
    'כתוב תיאור לקורס מנהיגות טרנספורמטיבית',
    'צור סילבוס לקורס ניהול צוות מרחוק',
    'כתוב שיעור פתיחה על קבלת החלטות בעת לחץ',
    'הצע 5 שאלות חידון על תקשורת מנהיגותית',
    'כתוב תרגיל מעשי לפיתוח אינטליגנציה רגשית',
  ];

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div className="ai-avatar">🤖</div>
        <div>
          <h3>סוכן תוכן AI</h3>
          <p className="ai-subtitle">מבוסס Claude · עוזר ביצירת תוכן לאקדמיה</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>שלום! אני כאן לעזור לך לבנות תוכן לאקדמיה למנהלים.</p>
            <p>ניתן לבקש ממני לכתוב קורסים, שיעורים, תרגילים ועוד.</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-btn" onClick={() => setInput(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="message-bubble">
              <pre className="message-text">{msg.content}</pre>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {error && <div className="chat-error">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="בקש מהסוכן לכתוב תוכן... (Enter לשליחה)"
          rows={3}
          disabled={loading}
        />
        <button
          className="btn btn-primary send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          שלח
        </button>
      </div>
    </div>
  );
}
