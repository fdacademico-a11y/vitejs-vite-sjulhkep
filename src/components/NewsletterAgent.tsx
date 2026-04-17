import { useState, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type { NewsletterStep, NewsletterConfig } from '../types';
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

function buildNewsletterPrompt(topic: string, focus: string): string {
  return `אתה עורך ניוזלטר בינלאומי מוביל בתחום פיתוח מנהלים.

משימה: לכתוב ניוזלטר קצר (5-10 משפטים בלבד) שיהיה חזק פסיכולוגית, עם עומק, השפעה והוקים.

נושא: ${topic}${focus ? `\nזווית נוספת: ${focus}` : ''}

סינתז את הידע שלך מהמקורות הבאים:
${SOURCES.map((s, i) => `${i + 1}. ${s}`).join('\n')}

חוקי הכתיבה:
• פתח עם הוק מהלם – עובדה נגד-אינטואיטיבית, שאלה שמטרידה, או פרדוקס שמפוצץ הנחה
• צור dissonance קוגניטיבי – אתגר את מה שהמנהל חשב שהוא יודע
• עומק פסיכולוגי – למה זה קורה ברמת הנפש, הדינמיקה הנסתרת
• דוגמה קונקרטית מעולם אמיתי – מנהיג מוכר, מחקר ספציפי, נתון
• סיים עם insight שמוליד פעולה מיידית או שאלת מראה אישית

פורמט סופי:
- בעברית מקצועית בלבד
- 5-10 משפטים רצופים, ללא כותרות, ללא נקודות
- כל משפט חייב לדחוף קדימה – ללא מילים מרפדות
- עוצמה של מנהיג שמדבר אמת שאנשים פוחדים לשמוע`;
}

function buildImagePrompt(newsletterContent: string, topic: string): string {
  return `You are a creative director for a premium management leadership brand.

Create a powerful, cinematic image prompt for this newsletter:
Topic: ${topic}
Content summary: ${newsletterContent.slice(0, 300)}

Requirements for the image prompt:
- Cinematic, dramatic lighting (dark backgrounds, single light source)
- Abstract or metaphorical visual representing leadership transformation
- No text, no faces (optional silhouette)
- Photorealistic style
- 1:1 square format for social media
- Emotional depth and tension

Return ONLY the image prompt in English, 2-3 sentences maximum.`;
}

interface Props {
  apiKey: string;
}

export function NewsletterAgent({ apiKey }: Props) {
  const [step, setStep] = useState<NewsletterStep>('config');
  const [config, setConfig] = useState<NewsletterConfig>({
    topic: NEWSLETTER_TOPICS[0],
    focus: '',
    email: localStorage.getItem('newsletter-email') ?? '',
    togetherApiKey: '',
  });
  const [newsletterContent, setNewsletterContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePromptText, setImagePromptText] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function saveConfig(updates: Partial<NewsletterConfig>) {
    const next = { ...config, ...updates };
    setConfig(next);
    if (updates.email !== undefined) localStorage.setItem('newsletter-email', updates.email);
    if (updates.togetherApiKey !== undefined)
      localStorage.setItem('together-api-key', updates.togetherApiKey);
  }

  async function generateNewsletter() {
    if (!apiKey) { setError('נדרש מפתח Anthropic API'); return; }
    setError('');
    setStep('generating');

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: buildNewsletterPrompt(config.topic, config.focus),
          },
        ],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      setNewsletterContent(text.trim());
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת הניוזלטר');
      setStep('config');
    }
  }

  function sendEmail() {
    const subject = encodeURIComponent(`ניוזלטר לאישור – ${config.topic}`);
    const body = encodeURIComponent(
      `שלום,\n\nלהלן הניוזלטר שנוצר על ידי הסוכן לאישורך:\n\n━━━━━━━━━━━━━━━━━\n${newsletterContent}\n━━━━━━━━━━━━━━━━━\n\nנושא: ${config.topic}\n\nלאישור – חזור לאפליקציה ולחץ "אישרתי, צור תמונה"`
    );
    const mailto = `mailto:${config.email}?subject=${subject}&body=${body}`;
    window.open(mailto, '_blank');
    setStep('email-sent');
  }

  async function generateImage() {
    setError('');
    setStep('generating-image');

    try {
      // Step 1: Generate image prompt with Claude
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const promptResponse = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: buildImagePrompt(newsletterContent, config.topic),
          },
        ],
      });
      const imgPrompt =
        promptResponse.content[0].type === 'text'
          ? promptResponse.content[0].text.trim()
          : 'Cinematic leadership transformation, dramatic lighting, dark background';

      setImagePromptText(imgPrompt);

      // Step 2: Generate image with Pollinations.ai (free, no API key needed)
      const encoded = encodeURIComponent(imgPrompt);
      const seed = Math.floor(Math.random() * 999999);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;
      setImageUrl(pollinationsUrl);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת התמונה');
      setStep('done');
    }
  }

  function reset() {
    setStep('config');
    setNewsletterContent('');
    setImageUrl('');
    setImagePromptText('');
    setError('');
    setEditMode(false);
  }

  return (
    <div className="newsletter-agent">
      {/* ── Header ── */}
      <div className="nl-header">
        <div className="nl-header-title">
          <span className="nl-icon">📰</span>
          <div>
            <h2>סוכן ניוזלטר AI</h2>
            <p className="nl-subtitle">סורק מקורות עולמיים · בונה תוכן חזק · שולח לאישור · מייצר תמונה</p>
          </div>
        </div>
        {step !== 'config' && (
          <button className="btn btn-secondary btn-sm" onClick={reset}>
            התחל מחדש
          </button>
        )}
      </div>

      {/* ── Progress bar ── */}
      <div className="nl-progress">
        {['config', 'preview', 'email-sent', 'done'].map((s, i) => (
          <div
            key={s}
            className={`nl-progress-step ${
              ['config', 'generating'].includes(step) && i === 0 ? 'active' :
              ['preview'].includes(step) && i === 1 ? 'active' :
              ['email-sent', 'generating-image'].includes(step) && i === 2 ? 'active' :
              step === 'done' && i === 3 ? 'active' : ''
            } ${
              (i === 0 && !['config', 'generating'].includes(step)) ||
              (i === 1 && ['email-sent', 'generating-image', 'done'].includes(step)) ||
              (i === 2 && ['done'].includes(step))
                ? 'completed' : ''
            }`}
          >
            <span className="nl-step-num">{i + 1}</span>
            <span className="nl-step-label">
              {['הגדרה', 'תצוגה', 'אישור', 'תמונה'][i]}
            </span>
          </div>
        ))}
      </div>

      {error && <div className="nl-error">{error}</div>}

      {/* ── Step 1: Config ── */}
      {(step === 'config' || step === 'generating') && (
        <div className="nl-card">
          <h3 className="nl-section-title">הגדרת הניוזלטר</h3>

          <div className="nl-sources-label">📚 מקורות שהסוכן סורק:</div>
          <div className="nl-sources-grid">
            {SOURCES.map((s) => (
              <span key={s} className="nl-source-tag">{s}</span>
            ))}
          </div>

          <div className="nl-form">
            <div className="form-group">
              <label>נושא הניוזלטר</label>
              <select
                value={config.topic}
                onChange={(e) => saveConfig({ topic: e.target.value })}
                disabled={step === 'generating'}
              >
                {NEWSLETTER_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>זווית ספציפית (אופציונלי)</label>
              <input
                value={config.focus}
                onChange={(e) => saveConfig({ focus: e.target.value })}
                placeholder="לדוגמה: מנהלים שעולים לתפקיד חדש"
                disabled={step === 'generating'}
              />
            </div>

            <div className="form-group">
              <label>כתובת מייל לאישור</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => saveConfig({ email: e.target.value })}
                placeholder="your@email.com"
                disabled={step === 'generating'}
                dir="ltr"
              />
            </div>

            <div className="nl-image-note">
              🖼️ תמונות נוצרות אוטומטית דרך Pollinations.ai — חינמי, ללא הגדרה
            </div>
          </div>

          <button
            className="btn btn-primary nl-generate-btn"
            onClick={generateNewsletter}
            disabled={step === 'generating'}
          >
            {step === 'generating' ? (
              <span className="nl-loading">
                <span className="nl-spinner" />
                סוכן סורק מקורות ובונה תוכן...
              </span>
            ) : (
              '🚀 צור ניוזלטר חזק'
            )}
          </button>
        </div>
      )}

      {/* ── Step 2: Preview ── */}
      {step === 'preview' && (
        <div className="nl-card">
          <div className="nl-preview-header">
            <h3 className="nl-section-title">✨ הניוזלטר מוכן</h3>
            <div className="nl-topic-tag">{config.topic}</div>
          </div>

          {editMode ? (
            <textarea
              ref={textareaRef}
              className="nl-content-edit"
              value={newsletterContent}
              onChange={(e) => setNewsletterContent(e.target.value)}
              rows={10}
            />
          ) : (
            <blockquote className="nl-content-display">{newsletterContent}</blockquote>
          )}

          <div className="nl-preview-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setEditMode(!editMode);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
            >
              {editMode ? '✓ סיים עריכה' : '✏️ ערוך'}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigator.clipboard.writeText(newsletterContent)}
            >
              📋 העתק
            </button>
            <button
              className="btn btn-primary"
              onClick={sendEmail}
              disabled={!config.email}
            >
              📧 שלח למייל לאישור
            </button>
          </div>
          {!config.email && (
            <p className="nl-warning">הזן כתובת מייל בהגדרות כדי לשלוח</p>
          )}
        </div>
      )}

      {/* ── Step 3: Email sent – waiting for approval ── */}
      {(step === 'email-sent' || step === 'generating-image') && (
        <div className="nl-card">
          <div className="nl-email-sent">
            <div className="nl-check-icon">📬</div>
            <h3>הניוזלטר נשלח ל-{config.email}</h3>
            <p>בדוק את תיבת הדואר שלך, קרא את הניוזלטר ואשר אותו כאן.</p>
          </div>

          <blockquote className="nl-content-display small">{newsletterContent}</blockquote>

          <div className="nl-approval-actions">
            <button className="btn btn-secondary" onClick={() => setStep('preview')}>
              ← ערוך שוב
            </button>
            <button
              className="btn btn-primary nl-approve-btn"
              onClick={generateImage}
              disabled={step === 'generating-image'}
            >
              {step === 'generating-image' ? (
                <span className="nl-loading">
                  <span className="nl-spinner" />
                  {config.togetherApiKey ? 'מייצר תמונה עם FLUX AI...' : 'בונה prompt לתמונה...'}
                </span>
              ) : (
                '✅ אישרתי – צור תמונה'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 'done' && (
        <div className="nl-card">
          <h3 className="nl-section-title">🎉 הכל מוכן לפרסום</h3>

          <div className="nl-final-content">
            <div className="nl-final-section">
              <h4>📝 הניוזלטר</h4>
              <blockquote className="nl-content-display small">{newsletterContent}</blockquote>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigator.clipboard.writeText(newsletterContent)}
              >
                📋 העתק טקסט
              </button>
            </div>

            {imageUrl ? (
              <div className="nl-final-section">
                <h4>🖼️ התמונה</h4>
                <img src={imageUrl} alt="תמונה לניוזלטר" className="nl-generated-image" />
                <a
                  href={imageUrl}
                  download="newsletter-image.png"
                  className="btn btn-primary btn-sm nl-download-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  ⬇️ הורד תמונה
                </a>
              </div>
            ) : (
              <div className="nl-final-section">
                <h4>🎨 Prompt לתמונה (Midjourney / DALL-E / Canva)</h4>
                <div className="nl-image-prompt">
                  <pre>{imagePromptText}</pre>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigator.clipboard.writeText(imagePromptText)}
                  >
                    📋 העתק prompt
                  </button>
                </div>
                <p className="nl-tip">
                  💡 הוסף מפתח Together AI בהגדרות לקבלת תמונה אוטומטית בפעם הבאה
                </p>
              </div>
            )}
          </div>

          <div className="nl-done-actions">
            <button className="btn btn-secondary" onClick={reset}>
              🔄 ניוזלטר חדש
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
