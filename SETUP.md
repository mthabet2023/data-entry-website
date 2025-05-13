# خطوات ربط التطبيق مع Google Sheets ونشره على Vercel

## أولاً: إعداد Google Sheets API

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. قم بإنشاء مشروع جديد
3. قم بتفعيل Google Sheets API:
   - اذهب إلى "Library" في القائمة
   - ابحث عن "Google Sheets API"
   - قم بتفعيلها

4. قم بإنشاء Service Account:
   - اذهب إلى "IAM & Admin" > "Service Accounts"
   - انقر على "Create Service Account"
   - أدخل اسم حساب الخدمة واضغط "Create"
   - اختر دور "Editor" ثم "Continue"
   - انقر على "Done"

5. قم بإنشاء مفتاح للحساب:
   - انقر على حساب الخدمة الذي أنشأته
   - اذهب إلى تبويب "Keys"
   - انقر على "Add Key" > "Create new key"
   - اختر "JSON" واضغط "Create"
   - سيتم تحميل ملف JSON يحتوي على بيانات الاعتماد

## ثانياً: إعداد Google Sheet

1. قم بإنشاء Google Sheet جديد
2. قم بإنشاء صفحتين:
   - الأولى باسم "Sheet1" لمحمد ثابت
   - الثانية باسم "Sheet2" لمحمد شيخون

3. في كل صفحة، أضف العناوين التالية في الصف الأول:
   - التاريخ
   - البيان
   - القيمة
   - المجموع

4. شارك الملف مع حساب الخدمة:
   - انقر على "Share"
   - الصق عنوان البريد الإلكتروني من ملف JSON (client_email)
   - امنح صلاحية "Editor"

5. انسخ معرف الملف من الرابط:
   - افتح Google Sheet
   - انسخ الجزء بين /d/ و /edit من الرابط
   مثال: `https://docs.google.com/spreadsheets/d/THIS-IS-YOUR-SHEET-ID/edit`

## ثالثاً: تحديث ملف .env

قم بتحديث ملف `.env` بالمعلومات التالية:
```
SHEET_ID=your-sheet-id-here
GOOGLE_CLIENT_EMAIL=client-email-from-json-file
GOOGLE_PRIVATE_KEY=private-key-from-json-file
PORT=3000
```

ملاحظة: عند نسخ `GOOGLE_PRIVATE_KEY`، تأكد من:
1. نسخ المفتاح كاملاً من `-----BEGIN PRIVATE KEY-----` إلى `-----END PRIVATE KEY-----`
2. استبدال `\n` في المفتاح بسطور جديدة حقيقية

## رابعاً: النشر على Vercel

1. قم بإنشاء حساب على [Vercel](https://vercel.com)

2. قم برفع المشروع إلى GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

3. في Vercel:
   - انقر على "New Project"
   - اختر المشروع من GitHub
   - أضف متغيرات البيئة:
     * `SHEET_ID`
     * `GOOGLE_CLIENT_EMAIL`
     * `GOOGLE_PRIVATE_KEY`
   - انقر على "Deploy"

4. بعد اكتمال النشر، يمكنك استخدام الرابط الذي يوفره Vercel للوصول إلى التطبيق

## اختبار التطبيق

1. جرب إضافة مصروف جديد لكل مسؤول
2. تأكد من ظهور البيانات في Google Sheet
3. جرب تعديل بيانات موجودة
4. تأكد من حساب المجموع بشكل صحيح

إذا واجهت أي مشاكل، تحقق من:
- صحة متغيرات البيئة
- صلاحيات الوصول في Google Sheet
- سجلات الخطأ في لوحة تحكم Vercel
