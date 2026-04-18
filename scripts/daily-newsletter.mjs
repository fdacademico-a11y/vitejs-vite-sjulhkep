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

async function generateImagePrompt(content) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are a visual director creating a social media image for this Hebrew leadership newsletter.

NEWSLETTER:
"""
${content}
"""

TASK: Create a highly specific image prompt based on the newsletter's main message.

Step 1 - Identify the core tension or insight (one sentence):
What is the SINGLE most important idea? (not leadership in general — the SPECIFIC idea in THIS text)

Step 2 - Find a concrete real-world object or scene that embodies it:
NOT abstract figures. Pick a SPECIFIC object: a broken clock, an empty chair at a table, a wilting plant next to a thriving one, two roads diverging, a puppet with cut strings, etc.

Step 3 - Write the final image prompt following this format exactly:
[Specific object/scene], [what it shows/does that connects to the newsletter's message], [lighting: dark room, single spotlight / golden hour / harsh fluorescent], photorealistic, cinematic, square 1:1, no text, no people.

Return ONLY Step 3. No explanations. No headings. Start directly with the object.`,
    }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  return raw.replace(/^#+\s*[^\n]*\n+/, '').trim() ||
    'An empty executive chair casting a long shadow under a single spotlight, surrounded by darkness, the armrests worn from years of decisions, photorealistic, cinematic, square 1:1.';
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

  console.log('📤 Calling Resend API...');
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.RECIPIENT_EMAIL,
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
  const missing = ['ANTHROPIC_API_KEY', 'RESEND_API_KEY', 'RECIPIENT_EMAIL']
    .filter(k => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required secrets: ${missing.join(', ')}`);
  }

  console.log('🔑 RESEND_API_KEY present:', process.env.RESEND_API_KEY.slice(0, 8) + '...');
  console.log('📬 RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL);

  const topic = getTodayTopic();
  console.log(`📌 Topic: ${topic}`);

  console.log('✍️  Generating newsletter...');
  const content = await generateNewsletter(topic);
  console.log('✅ Newsletter generated, length:', content.length);

  console.log('🎨 Generating image prompt...');
  const imagePrompt = await generateImagePrompt(content);
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
  await sendEmail(topic, content, imageUrl);

  console.log('🎉 Done!');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
