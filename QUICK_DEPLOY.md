# تعليمات سريعة للرفع 🚀

## قبل الرفع على السيرفر:

### 1️⃣ تعديل ملف Environment Variables
قم بنسخ:
```bash
cp .env.production.example .env.production
```

ثم افتح `.env.production` وغيّر:
```env
VITE_SITE_URL=https://your-actual-domain.com
```
⚠️ **مهم:** ضع رابط موقعك الحقيقي بدلاً من `your-actual-domain.com`

### 2️⃣ Build المشروع
```bash
npm run build
```

### 3️⃣ رفع مجلد `dist`
- ارفع **محتويات** مجلد `dist` (ليس المجلد نفسه) على السيرفر
- المكان: `public_html` أو `www` أو `htdocs`

---

## للرفع على Vercel (موصى به):

```bash
# تثبيت Vercel CLI
npm install -g vercel

# رفع المشروع
vercel

# للإنتاج
vercel --prod
```

### ضبط Environment Variables في Vercel:
1. اذهب إلى Dashboard → Project → Settings → Environment Variables
2. أضف:
   - `VITE_API_BASE_URL` = `https://backend.ascww.org/api`
   - `VITE_SITE_URL` = `https://your-project.vercel.app`

---

## اختبار المشاركة:

بعد الرفع، اختبر باستخدام:
- **Facebook:** https://developers.facebook.com/tools/debug/
- **Twitter:** https://cards-dev.twitter.com/validator

---

## إذا لم تظهر الصورة عند المشاركة:

1. تأكد أن `VITE_SITE_URL` صحيح
2. افتح Facebook Debugger واضغط "Scrape Again"
3. تأكد أن صورة الخبر متاحة على `backend.ascww.org`

---

## مشكلة CORS؟

إذا لم يعمل API، يجب على مطوّر Backend إضافة:
```
Access-Control-Allow-Origin: *
```

أو استخدم Vercel كـ Proxy (موجود بالفعل في المشروع).
