## الهدف
- نشر مشروعك الحالي من `c:\Users\mmaje\OneDrive\سطح المكتب\Abshir-Dallni` إلى مستودع على GitHub مع فرع افتراضي `main`.

## الافتراضات
- اسم المستودع: `Abshir-Dallni`.
- مستوى الرؤية: `private` (يمكن تغييره إلى `public` عند رغبتك).
- سنحافظ على هيكل المشروع كما هو، ونستثني الملفات الحساسة والمولدة.

## التحضير
- التأكد من وجود Git وتهيئة الاسم والبريد:
  - `git --version`
  - `git config --global user.name "اسمك"`
  - `git config --global user.email "بريدك"`
- المصادقة على GitHub:
  - إن كان GitHub CLI متاحًا: `gh auth login`
  - أو أنشئ المستودع يدويًا عبر موقع GitHub.

## تحديث .gitignore (أمان وخصوصية)
- الملف موجود بالفعل ويستثني: `node_modules`, `dist`, `server/public`.
- سنضيف الاستثناءات التالية قبل الرفع للحفاظ على السرية وحجم المستودع:
  - `/.env`
  - `/.local/`
  - أي ملفات مفاتيح/توكنات محلية إن وجدت.
- ملاحظة: يعتمد `server/openai.ts` على مفاتيح من المتغيرات البيئية؛ يجب ألا تُرفع مفاتيحك إلى GitHub.

## إنشاء المستودع
- خيار A (موصى به إن كان `gh` متاحًا):
  - من جذر المشروع:
    - `git init`
    - `git branch -M main`
    - `git add .`
    - `git commit -m "Initial commit"`
    - `gh repo create Abshir-Dallni --private --source . --remote origin --push`
- خيار B (يدوي عبر موقع GitHub):
  - أنشئ مستودعًا جديدًا باسم `Abshir-Dallni`.
  - ثم:
    - `git init`
    - `git branch -M main`
    - `git add .`
    - `git commit -m "Initial commit"`
    - `git remote add origin https://github.com/<username>/Abshir-Dallni.git`
    - `git push -u origin main`

## التحقق
- تأكد أن حالة Git نظيفة: `git status` (يجب أن تكون "nothing to commit, working tree clean").
- افتح المستودع على GitHub وتحقق من:
  - المجلدات: `client/`, `server/`, `shared/`، والملفات الأساسية مثل `package.json`, `vite.config.ts`.
  - غياب الملفات الحساسة (`.env`, `.local/`).

## ما الذي ستراه على GitHub
- مشروع واجهة أمامية React/Vite وواجهة خلفية Node/Drizzle كما هو في مجلدك.
- جاهز للاستنساخ والتشغيل عبر `npm install` ثم تشغيل السكربتات المعرفة في `package.json`.

## تأكيد
- هل توافق على الاسم `Abshir-Dallni` ومستوى الرؤية `private`؟
- عند الموافقة، سأنفّذ الخطوات أعلاه، أضيف الاستثناءات في `.gitignore` إذا لزم، وأنشئ/أربط المستودع وأدفع الكود.
