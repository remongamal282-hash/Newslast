import fs from 'fs';
import path from 'path';

export default async function handler(request, response) {
    const { id } = request.query;

    // Configuration
    const API_URL = 'https://backend.ascww.org/api/news';
    const IMAGE_BASE_URL = 'https://backend.ascww.org/api/news/image/';
    const PROD_SITE_URL = 'https://' + process.env.VERCEL_URL;
    const SITE_URL = process.env.VERCEL_URL ? PROD_SITE_URL : 'http://localhost:3000';

    // Default Meta Data
    const defaultMeta = {
        title: "شركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد",
        description: "الموقع الرسمي لشركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد - تابع أحدث الأخبار والخدمات",
        image: `${SITE_URL}/logo.png`,
        url: SITE_URL
    };

    let meta = defaultMeta;

    try {
        // 1. Fetch News Data
        const apiRes = await fetch(API_URL, {
            headers: { 'User-Agent': 'Vercel-SSR-Function' }
        });

        if (apiRes.ok) {
            const newsList = await apiRes.json();
            const newsItem = newsList.find(item => item.id == id);

            if (newsItem) {
                // Clean description by stripping HTML tags
                const rawDescription = newsItem.description || defaultMeta.description;
                const cleanDescription = rawDescription
                    .replace(/<[^>]*>/g, '') // Remove all HTML tags
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                meta = {
                    title: newsItem.title,
                    description: cleanDescription,
                    image: newsItem.news_images && newsItem.news_images.length > 0
                        ? IMAGE_BASE_URL + (newsItem.news_images[0].path.startsWith('/') ? newsItem.news_images[0].path.slice(1) : newsItem.news_images[0].path)
                        : defaultMeta.image,
                    url: `${SITE_URL}/news/${id}`
                };
            } else {
                meta.title = `News Not Found: ${id}`;
            }
        } else {
            console.error('Failed to fetch news data:', apiRes.status);
            meta.title = `API Error: ${apiRes.status}`;
        }

        // 2. Try to get index.html
        let html = null;

        try {
            const possiblePaths = [
                path.join(process.cwd(), 'dist', 'index.html'),
                path.join(process.cwd(), 'index.html'),
                path.join(process.cwd(), 'public', 'index.html')
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    html = fs.readFileSync(p, 'utf-8');
                    break;
                }
            }
        } catch (fsError) {
            console.warn('FS Read failed, falling back to fetch:', fsError);
        }

        if (!html) {
            const indexRes = await fetch(`${SITE_URL}/index.html`, {
                headers: { 'User-Agent': 'Vercel-SSR-Function' }
            });
            if (indexRes.ok) {
                html = await indexRes.text();
            } else {
                throw new Error(`Failed to fetch index.html: ${indexRes.status}`);
            }
        }

        // 3. Inject Meta Tags into real HTML

        // Clean description for safe injection
        const safeDescription = meta.description
            .substring(0, 200)
            .replace(/"/g, '&quot;');

        // Remove ALL existing meta tags to prevent duplicates
        html = html.replace(/<title>.*?<\/title>/s, '');
        html = html.replace(/<meta property="og:[^"]*"[^>]*>/g, '');
        html = html.replace(/<meta name="twitter:[^"]*"[^>]*>/g, '');

        // Inject fresh, clean tags with Facebook-required image properties
        const metaTags = `
            <title>${meta.title}</title>
            <meta property="og:title" content="${meta.title}" />
            <meta property="og:description" content="${safeDescription}" />
            <meta property="og:image" content="${meta.image}" />
            <meta property="og:image:secure_url" content="${meta.image}" />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content="${meta.title}" />
            <meta property="og:url" content="${meta.url}" />
            <meta property="og:type" content="article" />
            <meta property="og:site_name" content="شركة مياه الشرب والصرف الصحي بأسيوط" />
            <meta property="og:locale" content="ar_AR" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${meta.title}" />
            <meta name="twitter:description" content="${safeDescription}" />
            <meta name="twitter:image" content="${meta.image}" />`;

        html = html.replace('</head>', `${metaTags}</head>`);

        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return response.status(200).send(html);

    } catch (error) {
        console.error('SSR Error:', error);

        // 4. FALLBACK: Return minimal HTML with correct meta tags
        const safeDescription = meta.description
            .substring(0, 200)
            .replace(/"/g, '&quot;');

        const fallbackHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${meta.title}</title>
                <meta property="og:title" content="${meta.title}" />
                <meta property="og:description" content="${safeDescription}" />
                <meta property="og:image" content="${meta.image}" />
                <script>window.location.href = "/?redirect=/news/${id}";</script>
            </head>
            <body>
                <h1>جاري التحويل...</h1>
                <p><a href="/?redirect=/news/${id}">اضغط هنا إذا لم يتم التحويل تلقائياً</a></p>
            </body>
            </html>
        `;
        return response.status(200).send(fallbackHtml);
    }
}
