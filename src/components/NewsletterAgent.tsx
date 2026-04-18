import { useState, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { NEWSLETTER_TOPICS } from '../types';

const SOURCES = [
  'Harvard Business Review (HBR)',
  'McKinsey Quarterly',
  'MIT Sloan Management Review',
  'Stanford Social Innovation Review',
  'Adam Grant – Think Again & Give and Take',
  'Simon Sinek – Leaders Eat Last',
  'Brené Brown – Dare to Lead',
  'Daniel Kahneman – Thinking Fast and Slow',
  'מחקרי פסיכולוגיה ארגונית 2023–2025',
  'Gallup State of the Global Workplace 2024',
];

type Step = 'config' | 'generating-text' | 'generating-image' | 'done';

interface Props {
  apiKey: string;
}

export function NewsletterAgent({ apiKey }: Props) {
  const [step, setStep] = useState<Step>('config');
  const [topic, setTopic] = useState(NEWSLETTER_TOPICS[0]);
  const [focus, setFocus] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function generate() {
    if (!apiKey) { setError('נדרש מפתח Anthropic API'); return; }
    setError('');
    setContent('');
    setImageUrl('');
    setEditMode(false);

    // ── Step 1: Generate text ──
    setStep('generating-text');
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    let text = '';
    try {
      const seed = Math.floor(Math.random() * 10000);
      const today = new Date().toISOString().slice(0, 10);
      const res = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `אתה כותב תוכן לינקדאין מוביל בתחום מנהיגות וניהול.

כתוב פוסט לינקדאין על: ${topic}${focus ? `\nזווית: ${focus}` : ''}
תאריך: ${today} | גרסה: ${seed}

מבנה חובה (4 חלקים ברצף, ללא כותרות):
1. הוק (משפט אחד): עובדה מפתיעה, פרדוקס, או משפט שמנהל לא מצפה לו
2. מחקר ונתון (2 משפטים): ממצא ספציפי ממקור אמיתי עם מספרים ושמות מתוך: ${SOURCES.slice(0, 5).join(', ')}
3. הסבר (2 משפטים): למה זה קורה ומה זה אומר בפועל על הניהול
4. שאלה פרובוקטיבית (משפט אחד): שאלה שמחלקת דעות ומעוררת תגובות

חוקים מחייבים:
אסור להשתמש במקפים מכל סוג (לא - ולא --)
אסור bullet points או נקודות
אסור כותרות
עברית ישירה וחזקה
סך הכל 6 עד 8 משפטים בלבד`,
        }],
      });
      text = res.content[0].type === 'text' ? res.content[0].text.trim() : '';
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת הטקסט');
      setStep('config');
      return;
    }

    // ── Step 2: Generate image ──
    setStep('generating-image');
    try {
      const promptRes = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Create a photorealistic LinkedIn image prompt for a Hebrew leadership post.

TOPIC: ${topic}
KEY INSIGHT FROM POST: ${text.slice(0, 300)}

STRICT RULES:
- MUST be a business/corporate/office scene — NO nature, NO plants, NO animals, NO landscapes
- Choose ONE of these contexts: boardroom table, executive desk, office hallway, glass-walled meeting room, presentation screen, hands on a keyboard, whiteboard with diagrams
- The scene must visually represent the leadership insight
- Format exactly: [specific business scene], [what it conveys about the leadership insight], [lighting], photorealistic, cinematic, square 1:1, no text, no visible faces.

Return ONLY the image prompt. No explanations.`,
        }],
      });

      const imgPrompt = promptRes.content[0].type === 'text'
        ? promptRes.content[0].text.trim().replace(/^#+\s*[^\n]*\n+/, '').trim()
        : 'Empty boardroom table with a single chair pulled back, documents scattered and a whiteboard with erased diagrams still visible, harsh fluorescent lighting casting sharp shadows, photorealistic, cinematic, square 1:1, no text, no visible faces.';

      setImagePrompt(imgPrompt);
      const encoded = encodeURIComponent(imgPrompt);
      const seed = Math.floor(Math.random() * 999999);
      setImageUrl(`https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת התמונה');
    }

    setStep('done');
  }

  function reset() {
    setStep('config');
    setContent('');
    setImageUrl('');
    setImagePrompt('');
    setError('');
    setEditMode(false);
  }

  const isGenerating = step === 'generating-text' || step === 'generating-image';

  return (
    <div className="newsletter-agent">

      {/* Header */}
      <div className="nl-header">
        <div className="nl-header-title">
          <span className="nl-icon">📰</span>
          <div>
            <h2>סוכן ניוזלטר AI</h2>
            <p className="nl-subtitle">סורק מקורות עולמיים · כותב · מייצר תמונה</p>
          </div>
        </div>
        {step !== 'config' && !isGenerating && (
          <button className="btn btn-secondary btn-sm" onClick={reset}>🔄 חדש</button>
        )}
      </div>

      {/* Progress */}
      <div className="nl-progress">
        {[
          { label: 'הגדרה', active: step === 'config' || step === 'generating-text', done: step === 'generating-image' || step === 'done' },
          { label: 'תמונה',  active: step === 'generating-image', done: step === 'done' },
          { label: 'מוכן',   active: step === 'done', done: false },
        ].map(({ label, active, done }) => (
          <div key={label} className={`nl-progress-step ${active ? 'active' : ''} ${done ? 'completed' : ''}`}>
            <span className="nl-step-num" />
            <span className="nl-step-label">{label}</span>
          </div>
        ))}
      </div>

      {error && <div className="nl-error">{error}</div>}

      {/* Config + generating states */}
      {(step === 'config' || isGenerating) && (
        <div className="nl-card">
          <h3 className="nl-section-title">הגדרות</h3>

          <div className="nl-sources-label">📚 מקורות שהסוכן סורק:</div>
          <div className="nl-sources-grid">
            {SOURCES.map((s) => <span key={s} className="nl-source-tag">{s}</span>)}
          </div>

          <div className="nl-form">
            <div className="form-group">
              <label>נושא</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isGenerating}>
                {NEWSLETTER_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>זווית ספציפית (אופציונלי)</label>
              <input
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="לדוגמה: מנהלים שעולים לתפקיד חדש"
                disabled={isGenerating}
              />
            </div>
          </div>

          <button className="btn btn-primary nl-generate-btn" onClick={generate} disabled={isGenerating}>
            {step === 'generating-text' ? (
              <span className="nl-loading"><span className="nl-spinner" />סוכן כותב ניוזלטר...</span>
            ) : step === 'generating-image' ? (
              <span className="nl-loading"><span className="nl-spinner" />מייצר תמונה...</span>
            ) : (
              '🚀 צור ניוזלטר + תמונה'
            )}
          </button>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="nl-card">
          <div className="nl-preview-header">
            <h3 className="nl-section-title">🎉 מוכן לפרסום</h3>
            <div className="nl-topic-tag">{topic}</div>
          </div>

          {/* Text */}
          <div className="nl-final-section">
            {editMode ? (
              <textarea
                ref={textareaRef}
                className="nl-content-edit"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
              />
            ) : (
              <blockquote className="nl-content-display">{content}</blockquote>
            )}
            <div className="nl-preview-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => { setEditMode(!editMode); setTimeout(() => textareaRef.current?.focus(), 50); }}>
                {editMode ? '✓ סיים עריכה' : '✏️ ערוך'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(content)}>
                📋 העתק טקסט
              </button>
            </div>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="nl-final-section">
              <h4 className="nl-final-label">🖼️ תמונה לפוסט</h4>
              <img
                src={imageUrl}
                alt="תמונה לניוזלטר"
                className="nl-generated-image"
                onError={() => setError('התמונה לא נטענה — נסה לצור שוב')}
              />
              <div className="nl-preview-actions">
                <a href={imageUrl} download="newsletter.png" target="_blank" rel="noreferrer"
                   className="btn btn-secondary btn-sm">
                  ⬇️ הורד תמונה
                </a>
                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(imagePrompt)}>
                  📋 העתק prompt
                </button>
              </div>
            </div>
          )}

          <button className="btn btn-primary nl-generate-btn" onClick={generate}>
            🔄 צור גרסה חדשה לאותו נושא
          </button>
        </div>
      )}
    </div>
  );
}
