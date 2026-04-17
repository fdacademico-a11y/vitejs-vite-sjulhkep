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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `אתה עורך ניוזלטר בינלאומי מוביל בתחום פיתוח מנהלים.

משימה: לכתוב ניוזלטר קצר (5-10 משפטים בלבד) שיהיה חזק פסיכולוגית, עם עומק, השפעה והוקים.

נושא: ${topic}

סינתז את הידע שלך מהמקורות הבאים:
${SOURCES.map((s, i) => `${i + 1}. ${s}`).join('\n')}

חוקי הכתיבה:
• פתח עם הוק מהלם – עובדה נגד-אינטואיטיבית, שאלה שמטרידה, או פרדוקס
• צור dissonance קוגניטיבי – אתגר את מה שהמנהל חשב שהוא יודע
• עומק פסיכולוגי – למה זה קורה ברמת הנפש
• דוגמה קונקרטית מעולם אמיתי – מנהיג מוכר, מחקר ספציפי, נתון
• סיים עם insight שמוליד פעולה מיידית או שאלת מראה אישית

פורמט: בעברית מקצועית, 5-10 משפטים רצופים, ללא כותרות, ללא נקודות, ללא bullet points.`
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}

async function generateImagePrompt(content, topic) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Create a powerful cinematic image prompt for a leadership newsletter.
Topic: ${topic}
Content summary: ${content.slice(0, 250)}

Requirements:
- Cinematic, dramatic lighting (single light source, dark atmosphere)
- Abstract metaphor for leadership transformation or human psychology
- No text, no readable signs
- Photorealistic style
- Square 1:1 format suitable for social media

Return ONLY the image prompt in English, 2-3 sentences.`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : 'A lone figure standing at the edge of a cliff at dawn, dramatic golden light cutting through storm clouds, cinematic depth of field, photorealistic.';
}

async function generateImage(prompt) {
  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt,
      n: 1,
      width: 1024,
      height: 1024,
      steps: 4,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Together AI: ${err}`);
  }

  const data = await response.json();
  return data?.data?.[0]?.url ?? null;
}

async function fetchImageBase64(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString('base64');
}

async function sendEmail(topic, content, imageUrl) {
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

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.RECIPIENT_EMAIL,
    subject: `📰 ${topic} – ${today}`,
    html,
    attachments,
  });

  console.log('✅ Email sent to', process.env.RECIPIENT_EMAIL);
}

async function main() {
  const topic = getTodayTopic();
  console.log(`📌 Topic: ${topic}`);

  console.log('✍️  Generating newsletter...');
  const content = await generateNewsletter(topic);

  console.log('🎨 Generating image prompt...');
  const imagePrompt = await generateImagePrompt(content, topic);
  console.log('Prompt:', imagePrompt);

  let imageUrl = null;
  if (process.env.TOGETHER_API_KEY) {
    console.log('🖼️  Generating image...');
    try {
      imageUrl = await generateImage(imagePrompt);
      console.log('✅ Image:', imageUrl);
    } catch (e) {
      console.warn('⚠️  Image skipped:', e.message);
    }
  }

  console.log('📧 Sending email...');
  await sendEmail(topic, content, imageUrl);

  console.log('🎉 Done!');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
