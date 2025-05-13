# نظام إدخال المصروفات

نظام لإدخال وتتبع المصروفات اليومية مع تكامل مع Google Sheets.

## المميزات

- إدخال المصروفات مع التاريخ والبيان والقيمة
- تسجيل المصروفات لمسؤولين مختلفين (محمد ثابت ومحمد شيخون)
- عرض المصروفات في جدول مع إمكانية التعديل
- حساب المجموع التلقائي
- تخزين البيانات في Google Sheets

## متطلبات النظام

- Node.js
- حساب Google Cloud مع Google Sheets API مفعلة
- حساب خدمة Google (Service Account) للوصول إلى Google Sheets

## خطوات الإعداد

1. قم بنسخ الملفات:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. قم بتثبيت المتطلبات:
   ```bash
   npm install
   ```

3. قم بإنشاء ملف `.env` وأضف المتغيرات التالية:
   ```
   SHEET_ID=your_google_sheet_id_here
   GOOGLE_CLIENT_EMAIL=your_service_account_email_here
   GOOGLE_PRIVATE_KEY=your_private_key_here
   PORT=3000
   ```

4. قم بإعداد Google Sheet:
   - أنشئ جدول بيانات جديد
   - قم بتسمية الصفحة الأولى "Sheet1" والثانية "Sheet2"
   - أضف العناوين التالية في الصف الأول لكل صفحة:
     - التاريخ
     - البيان
     - القيمة
     - المجموع

5. تشغيل التطبيق محلياً:
   ```bash
   npm run dev
   ```

## النشر على Vercel

1. قم بإنشاء حساب على Vercel إذا لم يكن لديك
2. قم بربط المشروع مع GitHub
3. أضف متغيرات البيئة في إعدادات المشروع على Vercel:
   - `SHEET_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
4. انشر المشروع

## ملاحظات هامة

- تأكد من مشاركة Google Sheet مع عنوان البريد الإلكتروني لحساب الخدمة
- تأكد من تفعيل Google Sheets API في مشروع Google Cloud
- عند نسخ Private Key، استبدل `\n` بسطور جديدة في ملف `.env`

## المساهمة

نرحب بالمساهمات! يرجى إنشاء issue أو pull request لأي تحسينات.

## الترخيص

هذا المشروع مرخص تحت [ISC License](LICENSE).
