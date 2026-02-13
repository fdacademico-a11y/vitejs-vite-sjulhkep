import type { TeamMember, Task, CourseTemplate, CourseInstance, MonthlyFinancials, PlaybookStep, StrategyPillar } from './types';

export const initialTeamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'דניאל כהן', role: 'CEO', email: 'daniel@fdcollege.co.il', phone: '050-1234567', color: '#3b82f6' },
  { id: 'tm-2', name: 'מיכל לוי', role: 'COO', email: 'michal@fdcollege.co.il', phone: '050-2345678', color: '#8b5cf6' },
  { id: 'tm-3', name: 'יוסי אברהם', role: 'CMO', email: 'yossi@fdcollege.co.il', phone: '050-3456789', color: '#f59e0b' },
  { id: 'tm-4', name: 'נועה שמעון', role: 'CPO', email: 'noa@fdcollege.co.il', phone: '050-4567890', color: '#10b981' },
  { id: 'tm-5', name: 'אבי ישראלי', role: 'Instructor', email: 'avi@fdcollege.co.il', phone: '050-5678901', color: '#ef4444' },
  { id: 'tm-6', name: 'רונית דוד', role: 'Instructor', email: 'ronit@fdcollege.co.il', phone: '050-6789012', color: '#06b6d4' },
];

export const initialTasks: Task[] = [
  { id: 'task-1', title: 'הכנת תוכנית עסקית Q2', description: 'הכנת תוכנית עסקית מפורטת לרבעון הבא', assigneeId: 'tm-1', priority: 'critical', status: 'in-progress', dueDate: '2026-03-01', createdAt: '2026-02-01', tags: ['אסטרטגיה', 'כספים'] },
  { id: 'task-2', title: 'השקת קמפיין פייסבוק', description: 'קמפיין ממומן לקורסי AI חדשים', assigneeId: 'tm-3', priority: 'high', status: 'todo', dueDate: '2026-02-20', createdAt: '2026-02-05', tags: ['שיווק', 'פרסום'] },
  { id: 'task-3', title: 'עדכון סילבוס Prompt Engineering', description: 'עדכון תכני הקורס למודלים החדשים', assigneeId: 'tm-4', priority: 'high', status: 'in-progress', dueDate: '2026-02-25', createdAt: '2026-02-03', tags: ['תוכן', 'קורסים'] },
  { id: 'task-4', title: 'סגירת חוזה עם WeWork', description: 'סגירת הסכם שכירות חדרי הרצאה', assigneeId: 'tm-2', priority: 'medium', status: 'todo', dueDate: '2026-02-28', createdAt: '2026-02-04', tags: ['תפעול', 'לוגיסטיקה'] },
  { id: 'task-5', title: 'בניית דף נחיתה חדש', description: 'דף נחיתה עם המרה גבוהה לקורסים', assigneeId: 'tm-3', priority: 'high', status: 'done', dueDate: '2026-02-10', createdAt: '2026-01-20', tags: ['שיווק', 'דיגיטל'] },
  { id: 'task-6', title: 'הכנת חומרי קורס AI למתחילים', description: 'מצגות, תרגילים ומטלות', assigneeId: 'tm-5', priority: 'medium', status: 'in-progress', dueDate: '2026-03-05', createdAt: '2026-02-01', tags: ['תוכן'] },
  { id: 'task-7', title: 'אוטומציה - ManyChat', description: 'הגדרת זרימות אוטומטיות בווטסאפ', assigneeId: 'tm-3', priority: 'medium', status: 'todo', dueDate: '2026-03-01', createdAt: '2026-02-06', tags: ['שיווק', 'אוטומציה'] },
  { id: 'task-8', title: 'ראיונות מרצים חדשים', description: 'גיוס 2 מרצים נוספים לתחום GenAI', assigneeId: 'tm-2', priority: 'high', status: 'todo', dueDate: '2026-02-22', createdAt: '2026-02-07', tags: ['HR', 'גיוס'] },
  { id: 'task-9', title: 'דוח ביצועים חודשי', description: 'הכנת דוח ביצועים לצוות ההנהלה', assigneeId: 'tm-1', priority: 'low', status: 'todo', dueDate: '2026-03-01', createdAt: '2026-02-08', tags: ['דוחות'] },
  { id: 'task-10', title: 'תכנון סדנת AI Hackathon', description: 'אירוע חד-יומי לבוגרי הקורסים', assigneeId: 'tm-4', priority: 'low', status: 'todo', dueDate: '2026-04-01', createdAt: '2026-02-09', tags: ['אירועים'] },
];

export const initialCourseTemplates: CourseTemplate[] = [
  {
    id: 'tpl-1', name: 'AI למתחילים', category: 'core',
    description: 'קורס יסודות הבינה המלאכותית - ChatGPT, Claude, Gemini',
    durationWeeks: 8, sessionsPerWeek: 1, maxStudents: 25, pricePerStudent: 2800,
    instructorCostPerSession: 800, topics: ['מבוא ל-AI', 'ChatGPT', 'Claude', 'Gemini', 'תמונות AI', 'אוטומציה בסיסית']
  },
  {
    id: 'tpl-2', name: 'Prompt Engineering Pro', category: 'advanced',
    description: 'קורס מתקדם בהנדסת פרומפטים לשימוש מקצועי',
    durationWeeks: 6, sessionsPerWeek: 1, maxStudents: 20, pricePerStudent: 3500,
    instructorCostPerSession: 1000, topics: ['טכניקות פרומפט', 'Chain of Thought', 'Few-Shot', 'System Prompts', 'RAG', 'Fine-Tuning']
  },
  {
    id: 'tpl-3', name: 'AI לעסקים', category: 'workshop',
    description: 'סדנה לבעלי עסקים - איך להטמיע AI בעסק',
    durationWeeks: 4, sessionsPerWeek: 1, maxStudents: 30, pricePerStudent: 1800,
    instructorCostPerSession: 900, topics: ['AI באוטומציה', 'שיווק עם AI', 'שירות לקוחות', 'ניתוח נתונים']
  },
  {
    id: 'tpl-4', name: 'AI Bootcamp מלא', category: 'bootcamp',
    description: 'בוטקמפ אינטנסיבי - מאפס למקצוען AI',
    durationWeeks: 12, sessionsPerWeek: 2, maxStudents: 15, pricePerStudent: 8500,
    instructorCostPerSession: 1200, topics: ['Python', 'ML Basics', 'Deep Learning', 'NLP', 'Computer Vision', 'Deployment', 'AI Agents']
  },
  {
    id: 'tpl-5', name: 'AI ליצירתיות', category: 'seminar',
    description: 'סמינר יצירת תוכן עם AI - תמונות, וידאו, מוזיקה',
    durationWeeks: 4, sessionsPerWeek: 1, maxStudents: 25, pricePerStudent: 2200,
    instructorCostPerSession: 850, topics: ['Midjourney', 'DALL-E', 'Runway', 'Suno AI', 'עריכה AI']
  },
];

export const initialCourseInstances: CourseInstance[] = [
  {
    id: 'ci-1', templateId: 'tpl-1', name: 'AI למתחילים - תל אביב', city: 'תל אביב',
    location: 'WeWork שרונה', dayOfWeek: 'ראשון', timeSlot: '18:00-21:00',
    startDate: '2026-02-15', endDate: '2026-04-12', instructorId: 'tm-5',
    status: 'open-for-registration', maxStudents: 25, pricePerStudent: 2800,
    instructorCostPerSession: 800, sessionsTotal: 8, notes: '',
    registeredStudents: [
      { id: 's-1', name: 'אלון ברק', email: 'alon@email.com', phone: '050-1111111', courseId: 'ci-1', registrationDate: '2026-01-15', paymentStatus: 'paid', amountPaid: 2800, notes: '' },
      { id: 's-2', name: 'שירה גולן', email: 'shira@email.com', phone: '050-2222222', courseId: 'ci-1', registrationDate: '2026-01-18', paymentStatus: 'paid', amountPaid: 2800, notes: '' },
      { id: 's-3', name: 'עמית רוזן', email: 'amit@email.com', phone: '050-3333333', courseId: 'ci-1', registrationDate: '2026-01-20', paymentStatus: 'partial', amountPaid: 1400, notes: 'תשלום בשני חלקים' },
      { id: 's-4', name: 'דנה כץ', email: 'dana@email.com', phone: '050-4444444', courseId: 'ci-1', registrationDate: '2026-01-22', paymentStatus: 'paid', amountPaid: 2800, notes: '' },
      { id: 's-5', name: 'ניר חיים', email: 'nir@email.com', phone: '050-5555555', courseId: 'ci-1', registrationDate: '2026-01-25', paymentStatus: 'pending', amountPaid: 0, notes: 'ממתין לאישור' },
      { id: 's-6', name: 'תמר אשכנזי', email: 'tamar@email.com', phone: '050-6666666', courseId: 'ci-1', registrationDate: '2026-01-28', paymentStatus: 'paid', amountPaid: 2800, notes: '' },
      { id: 's-7', name: 'רועי מזרחי', email: 'roi@email.com', phone: '050-7777777', courseId: 'ci-1', registrationDate: '2026-02-01', paymentStatus: 'paid', amountPaid: 2800, notes: '' },
      { id: 's-8', name: 'מאיה פרידמן', email: 'maya@email.com', phone: '050-8888888', courseId: 'ci-1', registrationDate: '2026-02-03', paymentStatus: 'paid', amountPaid: 2800, notes: '' },
      { id: 's-9', name: 'עדי לביא', email: 'adi@email.com', phone: '050-9999999', courseId: 'ci-1', registrationDate: '2026-02-05', paymentStatus: 'paid', amountPaid: 2800, notes: '' },
      { id: 's-10', name: 'יונתן שפירא', email: 'yoni@email.com', phone: '050-1010101', courseId: 'ci-1', registrationDate: '2026-02-07', paymentStatus: 'partial', amountPaid: 1400, notes: '' },
    ]
  },
  {
    id: 'ci-2', templateId: 'tpl-2', name: 'Prompt Engineering - ירושלים', city: 'ירושלים',
    location: 'מרכז הייטק הר חוצבים', dayOfWeek: 'שלישי', timeSlot: '18:00-21:00',
    startDate: '2026-02-17', endDate: '2026-03-31', instructorId: 'tm-6',
    status: 'open-for-registration', maxStudents: 20, pricePerStudent: 3500,
    instructorCostPerSession: 1000, sessionsTotal: 6, notes: '',
    registeredStudents: [
      { id: 's-11', name: 'אורי בן דוד', email: 'ori@email.com', phone: '052-1111111', courseId: 'ci-2', registrationDate: '2026-01-20', paymentStatus: 'paid', amountPaid: 3500, notes: '' },
      { id: 's-12', name: 'ליאת סגל', email: 'liat@email.com', phone: '052-2222222', courseId: 'ci-2', registrationDate: '2026-01-22', paymentStatus: 'paid', amountPaid: 3500, notes: '' },
      { id: 's-13', name: 'גיא פלד', email: 'guy@email.com', phone: '052-3333333', courseId: 'ci-2', registrationDate: '2026-01-25', paymentStatus: 'paid', amountPaid: 3500, notes: '' },
      { id: 's-14', name: 'הדס נתן', email: 'hadas@email.com', phone: '052-4444444', courseId: 'ci-2', registrationDate: '2026-02-01', paymentStatus: 'pending', amountPaid: 0, notes: '' },
      { id: 's-15', name: 'אסף כהן', email: 'asaf@email.com', phone: '052-5555555', courseId: 'ci-2', registrationDate: '2026-02-05', paymentStatus: 'paid', amountPaid: 3500, notes: '' },
    ]
  },
  {
    id: 'ci-3', templateId: 'tpl-3', name: 'AI לעסקים - חיפה', city: 'חיפה',
    location: 'מתם פארק המדע', dayOfWeek: 'רביעי', timeSlot: '17:00-20:00',
    startDate: '2026-03-01', endDate: '2026-03-29', instructorId: 'tm-5',
    status: 'at-risk', maxStudents: 30, pricePerStudent: 1800,
    instructorCostPerSession: 900, sessionsTotal: 4, notes: 'רק 3 נרשמים - נדרש שיווק דחוף',
    registeredStudents: [
      { id: 's-16', name: 'רון אביב', email: 'ron@email.com', phone: '054-1111111', courseId: 'ci-3', registrationDate: '2026-02-01', paymentStatus: 'paid', amountPaid: 1800, notes: '' },
      { id: 's-17', name: 'קרן יוסף', email: 'keren@email.com', phone: '054-2222222', courseId: 'ci-3', registrationDate: '2026-02-05', paymentStatus: 'paid', amountPaid: 1800, notes: '' },
      { id: 's-18', name: 'עומר חן', email: 'omer@email.com', phone: '054-3333333', courseId: 'ci-3', registrationDate: '2026-02-08', paymentStatus: 'pending', amountPaid: 0, notes: '' },
    ]
  },
  {
    id: 'ci-4', templateId: 'tpl-4', name: 'AI Bootcamp - תל אביב', city: 'תל אביב',
    location: 'Campus TLV', dayOfWeek: 'חמישי', timeSlot: '09:00-16:00',
    startDate: '2026-01-10', endDate: '2026-04-10', instructorId: 'tm-6',
    status: 'in-progress', maxStudents: 15, pricePerStudent: 8500,
    instructorCostPerSession: 1200, sessionsTotal: 24, notes: 'קורס פרימיום - שביעות רצון גבוהה',
    registeredStudents: [
      { id: 's-19', name: 'איתי ברקוביץ', email: 'itai@email.com', phone: '053-1111111', courseId: 'ci-4', registrationDate: '2025-12-15', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-20', name: 'נעמי וייס', email: 'naomi@email.com', phone: '053-2222222', courseId: 'ci-4', registrationDate: '2025-12-18', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-21', name: 'תום גרינברג', email: 'tom@email.com', phone: '053-3333333', courseId: 'ci-4', registrationDate: '2025-12-20', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-22', name: 'שני מלכה', email: 'shani@email.com', phone: '053-4444444', courseId: 'ci-4', registrationDate: '2025-12-22', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-23', name: 'אריאל צדוק', email: 'ariel@email.com', phone: '053-5555555', courseId: 'ci-4', registrationDate: '2025-12-25', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-24', name: 'יעל הרשקו', email: 'yael@email.com', phone: '053-6666666', courseId: 'ci-4', registrationDate: '2025-12-28', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-25', name: 'עידן סלע', email: 'idan@email.com', phone: '053-7777777', courseId: 'ci-4', registrationDate: '2026-01-02', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-26', name: 'מור אטיאס', email: 'mor@email.com', phone: '053-8888888', courseId: 'ci-4', registrationDate: '2026-01-05', paymentStatus: 'partial', amountPaid: 4250, notes: 'תשלום בשני חלקים' },
      { id: 's-27', name: 'ליאור פינטו', email: 'lior@email.com', phone: '053-9999999', courseId: 'ci-4', registrationDate: '2026-01-07', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
      { id: 's-28', name: 'רותם אלון', email: 'rotem@email.com', phone: '053-1010101', courseId: 'ci-4', registrationDate: '2026-01-08', paymentStatus: 'paid', amountPaid: 8500, notes: '' },
    ]
  },
  {
    id: 'ci-5', templateId: 'tpl-5', name: 'AI ליצירתיות - באר שבע', city: 'באר שבע',
    location: 'גביש סנטר', dayOfWeek: 'שני', timeSlot: '18:00-21:00',
    startDate: '2026-03-10', endDate: '2026-04-07', instructorId: 'tm-5',
    status: 'scheduled', maxStudents: 25, pricePerStudent: 2200,
    instructorCostPerSession: 850, sessionsTotal: 4, notes: '',
    registeredStudents: []
  },
];

export const initialMonthlyFinancials: MonthlyFinancials[] = [
  { month: 'ינואר', year: 2026, revenue: 95000, instructorCosts: 28000, marketingCosts: 15000, operationalCosts: 8000, platformCosts: 3000, otherCosts: 2000 },
  { month: 'פברואר', year: 2026, revenue: 125000, instructorCosts: 35000, marketingCosts: 20000, operationalCosts: 8000, platformCosts: 3000, otherCosts: 2500 },
  { month: 'מרץ', year: 2026, revenue: 155000, instructorCosts: 42000, marketingCosts: 25000, operationalCosts: 10000, platformCosts: 3000, otherCosts: 3000 },
  { month: 'אפריל', year: 2026, revenue: 140000, instructorCosts: 38000, marketingCosts: 18000, operationalCosts: 9000, platformCosts: 3000, otherCosts: 2000 },
  { month: 'מאי', year: 2026, revenue: 170000, instructorCosts: 45000, marketingCosts: 22000, operationalCosts: 10000, platformCosts: 3500, otherCosts: 2500 },
  { month: 'יוני', year: 2026, revenue: 110000, instructorCosts: 30000, marketingCosts: 12000, operationalCosts: 7000, platformCosts: 3000, otherCosts: 2000 },
];

export const initialPlaybookSteps: PlaybookStep[] = [
  { id: 'pb-1', order: 1, title: 'אישור תקציב ותוכנית', description: 'אישור תקציב הקורס ותוכנית השיווק ע"י CEO', assigneeRole: 'CEO', daysBeforeLaunch: 30, category: 'planning', isAutoGenTask: true },
  { id: 'pb-2', order: 2, title: 'סגירת מרצה ומיקום', description: 'סגירת מרצה זמין וחדר הרצאות', assigneeRole: 'COO', daysBeforeLaunch: 28, category: 'logistics', isAutoGenTask: true },
  { id: 'pb-3', order: 3, title: 'הכנת תכני שיווק', description: 'יצירת קריאייטיב, טקסטים ווידאו לקמפיין', assigneeRole: 'CMO', daysBeforeLaunch: 25, category: 'marketing', isAutoGenTask: true },
  { id: 'pb-4', order: 4, title: 'הקמת דף נחיתה', description: 'בניית דף נחיתה ייעודי עם טופס רישום', assigneeRole: 'CMO', daysBeforeLaunch: 23, category: 'marketing', isAutoGenTask: true },
  { id: 'pb-5', order: 5, title: 'הכנת סילבוס ותכנים', description: 'הכנת סילבוס, מצגות, תרגילים ומשימות', assigneeRole: 'CPO', daysBeforeLaunch: 21, category: 'content', isAutoGenTask: true },
  { id: 'pb-6', order: 6, title: 'השקת קמפיין פרסום', description: 'השקת קמפיין ממומן בפייסבוק, אינסטגרם וגוגל', assigneeRole: 'CMO', daysBeforeLaunch: 20, category: 'marketing', isAutoGenTask: true },
  { id: 'pb-7', order: 7, title: 'הגדרת ManyChat', description: 'הגדרת זרימות WhatsApp אוטומטיות להרשמה', assigneeRole: 'CMO', daysBeforeLaunch: 18, category: 'marketing', isAutoGenTask: true },
  { id: 'pb-8', order: 8, title: 'שליחת ניוזלטר', description: 'שליחת מייל לרשימת התפוצה עם הצעת ה-Early Bird', assigneeRole: 'CMO', daysBeforeLaunch: 15, category: 'marketing', isAutoGenTask: true },
  { id: 'pb-9', order: 9, title: 'בדיקת ציוד ותשתיות', description: 'בדיקת מחשבים, פרויקטור, אינטרנט באולם', assigneeRole: 'COO', daysBeforeLaunch: 7, category: 'logistics', isAutoGenTask: true },
  { id: 'pb-10', order: 10, title: 'שליחת תזכורות לנרשמים', description: 'שליחת WhatsApp ומייל תזכורת לכל הנרשמים', assigneeRole: 'COO', daysBeforeLaunch: 2, category: 'operations', isAutoGenTask: true },
];

export const initialStrategyPillars: StrategyPillar[] = [
  {
    id: 'sp-1', title: 'מצוינות אקדמית', icon: 'GraduationCap',
    description: 'להיות המוסד המוביל בישראל להוראת AI עם תוכן עדכני ומרצים מהשורה הראשונה',
    objectives: ['עדכון סילבוסים כל רבעון', 'ציון שביעות רצון מעל 4.5', 'שיתופי פעולה עם תעשייה'],
    kpis: ['NPS > 70', 'שביעות רצון > 4.5/5', 'שיעור השלמה > 85%']
  },
  {
    id: 'sp-2', title: 'צמיחה ושיווק', icon: 'TrendingUp',
    description: 'הגדלת מספר הסטודנטים ב-50% תוך שנה עם CAC מותאם',
    objectives: ['הגעה ל-500 סטודנטים פעילים', 'הרחבה ל-5 ערים', 'פיתוח ערוץ B2B'],
    kpis: ['500 סטודנטים', 'CAC < ₪400', 'LTV > ₪5,000']
  },
  {
    id: 'sp-3', title: 'יעילות תפעולית', icon: 'Settings',
    description: 'אוטומציה מקסימלית של תהליכי ניהול והוראה',
    objectives: ['אוטומציה של 80% מהתהליכים', 'מערכת CRM משולבת', 'דשבורד BI בזמן אמת'],
    kpis: ['זמן ניהול < 2 שעות/יום', 'אוטומציה > 80%', 'Occupancy > 70%']
  },
  {
    id: 'sp-4', title: 'חדשנות ומוצר', icon: 'Lightbulb',
    description: 'פיתוח מוצרים חדשים ופורמטים חדשניים ללמידת AI',
    objectives: ['השקת 3 קורסים חדשים', 'פיתוח פלטפורמת למידה', 'קורסי Online'],
    kpis: ['3 קורסים חדשים/רבעון', 'פלטפורמה חיה Q3', 'Revenue Online > 20%']
  },
];
