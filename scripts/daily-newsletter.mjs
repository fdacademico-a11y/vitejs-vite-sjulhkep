import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

const TOPICS = [
  'מנהיגות טרנספורמטיבית',
  'ניהול ביצועים',
  'אינטליגנציה רגשית במנהיגות',
  'קבלת החלטות בלחץ',
  'בניית תרבות ארגונית',
  'ניהול שינוי',
  'פיתוח צוות מנצח',
  'תקשורת מנהיגותית',
  'חדשנות וחשיבה יצירתית',
  'ניהול עצמי ומיקוד',
  'השפעה ללא סמכות',
  'פסיכולוגיה של מוטיבציה',
];

const SOURCES = [
  'Harvard Business Review (HBR)',
  'McKinsey Quarterly',
  'MIT Sloan Management Review',
  'Adam Grant – Think Again & Give and Take',
  'Simon Sinek – Leaders Eat Last',
  'Brené Brown – Dare to Lead',
  'Daniel Kahneman – Thinking Fast and Slow',
  'Gallup State of the Global Workplace 2024',
  'Stanford Social Innovation Review',
  'מחקרי פסיכולוגיה ארגונית 2023–2025',
];

function getTodayTopic() {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return TOPICS[dayOfYear % TOPICS.length];
}

async function generateNewsletter(topic) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const today = new Date().toISOString().slice(0, 10);
  const seed = Math.floor(Math.random() * 10000);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `אתה כותב תוכן לינקדאין מוביל בתחום מנהיגות וניהול.

כתוב פוסט לינקדאין על: ${topic}
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

  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}

async function generateImagePrompt(topic, content) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Create a photorealistic LinkedIn image prompt for a Hebrew leadership post.

TOPIC: ${topic}
KEY INSIGHT FROM POST: ${content.slice(0, 300)}

STRICT RULES:
- MUST be a business/corporate/office scene — NO nature, NO plants, NO animals, NO landscapes
- Choose ONE of these contexts: boardroom table, executive desk, office hallway, glass-walled meeting room, presentation screen, hands on a keyboard, whiteboard with diagrams
- The scene must visually represent the leadership insight
- Format exactly: [specific business scene], [what it conveys about the leadership insight], [lighting], photorealistic, cinematic, square 1:1, no text, no visible faces.

Return ONLY the image prompt. No explanations.`,
    }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  return raw.replace(/^#+\s*[^\n]*\n+/, '').trim() ||
    'Empty boardroom table with a single chair pulled back, documents scattered and a whiteboard with erased diagrams still visible, harsh fluorescent lighting casting sharp shadows, photorealistic, cinematic, square 1:1, no text, no visible faces.';
}

async function generateImage(prompt) {
  // Pollinations.ai — free, no API key needed
  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;

  // Verify the image is reachable
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pollinations.ai error: ${response.status}`);
  return url;
}

async function postToLinkedIn(text, imageUrl) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('⏭️  MAKE_WEBHOOK_URL not configured — skipping LinkedIn');
    return;
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, imageUrl: imageUrl || null }),
  });

  if (!res.ok) throw new Error(`Make.com webhook failed: ${res.status}`);
  console.log('✅ LinkedIn post sent via Make.com');
}

async function fetchImageBase64(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString('base64');
}

async function sendEmail(topic, content, imageUrl, recipients) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Jerusalem',
  });

  const hashtags = `#מנהיגות #פיתוח_מנהלים #${topic.replace(/\s+/g, '_')} #האקדמיה_למנהלים`;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0f0a1e;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">${today}</div>
      <div style="font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">🎓 האקדמיה למנהלים</div>
      <div style="display:inline-block;background:rgba(124,58,237,0.2);color:#a78bfa;font-size:13px;padding:4px 14px;border-radius:20px;margin-top:8px;">ניוזלטר יומי · ${topic}</div>
    </div>

    <div style="background:linear-gradient(135deg,#1e1b2e 0%,#2d1b4e 100%);border-radius:16px;padding:28px;border-right:4px solid #7c3aed;margin-bottom:20px;">
      <p style="color:#e9d5ff;font-size:16px;line-height:2;margin:0;white-space:pre-wrap;">${content}</p>
    </div>

    ${imageUrl ? `<div style="margin-bottom:20px;"><img src="${imageUrl}" alt="תמונה לפוסט" style="width:100%;border-radius:14px;display:block;box-shadow:0 8px 32px rgba(0,0,0,0.4);" /></div>` : ''}

    <div style="background:#12101f;border:1.5px dashed #4c1d95;border-radius:14px;padding:22px;margin-bottom:20px;">
      <div style="font-size:11px;color:#6b7280;margin-bottom:14px;text-align:center;text-transform:uppercase;letter-spacing:1px;">📋 העתק לפייסבוק / לינקדאין</div>
      <p style="color:#e9d5ff;font-size:15px;line-height:1.85;margin:0;white-space:pre-wrap;">${content}

${hashtags}</p>
    </div>

    <div style="text-align:center;font-size:11px;color:#374151;padding-top:8px;border-top:1px solid #1f2937;">
      נוצר אוטומטית על ידי סוכן AI · האקדמיה למנהלים
    </div>
  </div>
</body>
</html>`;

  const attachments = [];
  if (imageUrl) {
    try {
      const content64 = await fetchImageBase64(imageUrl);
      attachments.push({ filename: `newsletter-${Date.now()}.png`, content: content64 });
    } catch (e) {
      console.warn('Image attach failed:', e.message);
    }
  }

  console.log('📤 Calling Resend API...');
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: recipients,
    subject: `📰 ${topic} – ${today}`,
    html,
    attachments,
  });

  console.log('📨 Resend response:', JSON.stringify(result));
  if (result.error) throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
  console.log('✅ Email sent, id:', result.data?.id);
}

async function main() {
  // Validate required env vars upfront
  const missing = ['ANTHROPIC_API_KEY', 'RESEND_API_KEY', 'RECIPIENT_EMAILS']
    .filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required secrets: ${missing.join(', ')}`);
  }

  const recipients = process.env.RECIPIENT_EMAILS.split(',').map(e => e.trim()).filter(Boolean);
  console.log('🔑 RESEND_API_KEY present:', process.env.RESEND_API_KEY.slice(0, 8) + '...');
  console.log('📬 Recipients:', recipients);

  const topic = getTodayTopic();
  console.log(`📌 Topic: ${topic}`);

  console.log('✍️  Generating newsletter...');
  const content = await generateNewsletter(topic);
  console.log('✅ Newsletter generated, length:', content.length);

  console.log('🎨 Generating image prompt...');
  const imagePrompt = await generateImagePrompt(topic, content);
  console.log('Prompt:', imagePrompt);

  let imageUrl = null;
  console.log('🖼️  Generating image (Pollinations.ai)...');
  try {
    imageUrl = await generateImage(imagePrompt);
    console.log('✅ Image:', imageUrl);
  } catch (e) {
    console.warn('⚠️  Image skipped:', e.message);
  }

  console.log('📧 Sending email...');
  await sendEmail(topic, content, imageUrl, recipients);

  console.log('📤 Posting to LinkedIn...');
  try {
    await postToLinkedIn(content, imageUrl);
  } catch (e) {
    console.warn('⚠️  LinkedIn post failed:', e.message);
  }

  console.log('🎉 Done!');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
