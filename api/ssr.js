import fs from 'fs';
import path from 'path';

export default async function handler(request, response) {
    const { id } = request.query;

    // Configuration
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
        // We fetch early so we have the data for BOTH the happy path and the fallback path
        const apiRes = await fetch(API_URL, {
            headers: { 'User-Agent': 'Vercel-SSR-Function' }
        });

        if (apiRes.ok) {
            const newsList = await apiRes.json();
            const newsItem = newsList.find(item => item.id == id);

            if (newsItem) {
                meta = {
                    title: newsItem.title,
                    description: newsItem.description ? newsItem.description.substring(0, 200) : defaultMeta.description,
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
        // Strategy A: Read from Filesystem (fastest, most reliable if path matches)
        // Strategy B: Fetch from URL (fallback)
        let html = null;

        try {
            // Vercel output structure often places index.html in the root or public
            // However, in serverless functions, files must be explicitly included or are in process.cwd()
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
        html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
        const metaTags = `
            <meta property="og:title" content="${meta.title}" />
            <meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />
            <meta property="og:image" content="${meta.image}" />
            <meta property="og:url" content="${meta.url}" />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${meta.title}" />
            <meta name="twitter:description" content="${meta.description.replace(/"/g, '&quot;')}" />
            <meta name="twitter:image" content="${meta.image}" />`;

        html = html.replace('</head>', `${metaTags}</head>`);

        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return response.status(200).send(html);

    } catch (error) {
        console.error('SSR Error:', error);

        // 4. FALLBACK: Return a minimal HTML shell with the CORRECT META TAGS
        // This ensures link sharing works even if the full app render fails effectively.
        // The user will be redirected to the home page -> client router handles the rest.
        const fallbackHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${meta.title}</title>
                <meta property="og:title" content="${meta.title}" />
                <meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />
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
