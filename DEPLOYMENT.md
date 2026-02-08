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

### الخيار 2: الرفع على سيرفر خاص (cPanel / VPS) مع دعم Node.js 🚀

⚠️ **مهم جداً:** للحصول على Meta Tags وتفاصيل الخبر عند المشاركة، **يجب** تشغيل التطبيق كـ Node.js Server وليس مجرد رفع ملفات HTML.

#### إذا كنت تستخدم cPanel:

1. **اذهب إلى "Setup Node.js App" في لوحة التحكم.**
2. **أنشئ تطبيق جديد:**
   - **Node.js Version:** اختر 18 أو 20.
   - **Application Mode:** Production.
   - **Application Root:** المسار الذي سترفع فيه الملفات (مثلاً `news-app`).
   - **Application URL:** رابط موقعك.
   - **Application Startup File:** `server.js`
3. **ارفع ملفات المشروع:**
   - ارفع **كل الملفات** ما عدا `node_modules`.
   - تأكد من وجود `server.js`, `package.json`, وملف `.env.production`.
4. **تثبيت الحزم (Dependencies):**
   - في واجهة Node.js App، اضغط على "Run NPM Install".
5. **Build المشروع:**
   - شغل الأمر `npm run build:prod` عبر Terminal في cPanel أو عبر SSH.
   - أو يمكنك رفع مجلد `dist` جاهزاً من جهازك (بعد عمل Build محلياً).
6. **التشغيل:**
   - اضغط "Restart" للتطبيق.

#### إذا كنت تستخدم VPS (Ubuntu/Linux):

1. **تثبيت Node.js & PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **رفع المشروع وعمل Build:**
   ```bash
   # بعد رفع الملفات
   npm install
   npm run build:prod
   ```

3. **تشغيل السيرفر باستخدام PM2:**
   ```bash
   pm2 start server.js --name "news-app"
   pm2 save
   pm2 startup
   ```

4. **إعداد Nginx كـ Reverse Proxy (إذا لزم الأمر):**
   ```nginx
   server {
       server_name news.ascww.org;
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
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
