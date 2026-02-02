# دليل الرفع على السيرفر 🚀

## المشاكل التي تم حلها ✅

### 1. مشكلة API لا يعمل على السيرفر
**السبب:** كان المشروع يستخدم Vite Proxy الذي يعمل فقط في بيئة التطوير (localhost)

**الحل:** تم إعداد المشروع لاستخدام Environment Variables للتحكم في API URL

### 2. مشكلة المشاركة - عدم ظهور الصورة والتفاصيل
**السبب:** المشروع يستخدم Client-Side Rendering (CSR) فقط

**الحل:** تم إضافة Server-Side Rendering (SSR) لصفحات التفاصيل + تحسين Open Graph Meta Tags

---

## خطوات الرفع على السيرفر 📦

### الخيار 1: الرفع على Vercel (موصى به) ⭐

1. **قم بإنشاء حساب على Vercel:**
   - زر موقع [vercel.com](https://vercel.com)
   - قم بتسجيل الدخول باستخدام GitHub

2. **رفع المشروع:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **ضبط Environment Variables في Vercel:**
   - اذهب إلى Project Settings → Environment Variables
   - أضف المتغيرات التالية:
     ```
     VITE_API_BASE_URL = https://backend.ascww.org/api
     VITE_SITE_URL = https://your-vercel-domain.vercel.app
     ```

4. **إعادة Deploy:**
   ```bash
   vercel --prod
   ```

### الخيار 2: الرفع على سيرفر خاص (cPanel / VPS)

1. **Build المشروع:**
   ```bash
   npm run build
   ```

2. **ضبط Environment Variables:**
   - قم بنسخ ملف `.env.production.example` إلى `.env.production`
   - قم بتعديل `VITE_SITE_URL` ليكون رابط موقعك الفعلي
   - مثال:
     ```
     VITE_API_BASE_URL=https://backend.ascww.org/api
     VITE_SITE_URL=https://www.your-domain.com
     ```

3. **Build مرة أخرى بعد ضبط المتغيرات:**
   ```bash
   npm run build
   ```

4. **رفع مجلد `dist` على السيرفر:**
   - ارفع محتويات مجلد `dist` إلى public_html أو www

5. **ضبط .htaccess (مهم جداً):**
   تأكد أن ملف `.htaccess` موجود في public_html ويحتوي على:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## اختبار المشاركة 🔍

### لاختبار Open Graph Tags:

1. **استخدم Facebook Debugger:**
   - [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
   - ضع رابط الخبر واضغط Debug
   - اضغط "Scrape Again" لتحديث الكاش

2. **استخدم Twitter Card Validator:**
   - [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)

### لاختبار API:

افتح Console في المتصفح وتأكد من عدم وجود أخطاء CORS

---

## ملاحظات مهمة ⚠️

### مشكلة CORS المتوقعة:
إذا كان API الخاص بك (`backend.ascww.org`) لا يسمح بـ CORS، **لن تعمل الطلبات مباشرة من المتصفح**.

**الحل الأمثل:**
يجب على مطوّر الـ Backend إضافة Headers التالية للسماح بالطلبات:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**حل بديل:**
إذا لم يكن بالإمكان تعديل Backend، يمكنك:
1. استخدام Vercel Serverless Functions (موجودة بالفعل في `/api/*`)
2. أو استخدام Cloudflare Workers كـ Proxy

---

## المزايا الجديدة ✨

✅ API يعمل في كل من Development و Production  
✅ Open Graph Tags ديناميكية لكل خبر  
✅ دعم المشاركة على Facebook و WhatsApp  
✅ يظهر صورة الخبر والتفاصيل عند المشاركة  
✅ SEO محسّن  
✅ Configuration مرن عبر Environment Variables

---

## الدعم الفني 💬

إذا واجهت أي مشاكل:
1. تأكد من أن `VITE_SITE_URL` صحيح
2. تأكد من أن API متاح ويعمل
3. افحص Console في المتصفح للأخطاء
4. جرب Facebook Debugger لفحص Meta Tags

---

صنع بـ ❤️ لشركة مياه أسيوط
