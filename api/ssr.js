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

    try {
        // 1. Fetch News Data
        const apiRes = await fetch(API_URL, {
            headers: { 'User-Agent': 'Vercel-SSR-Function' }
        });

        let newsItem = null;
        if (apiRes.ok) {
            const newsList = await apiRes.json();
            newsItem = newsList.find(item => item.id == id);
        } else {
            console.error('Failed to fetch news data:', apiRes.status);
        }

        // Prepare Meta Data
        const meta = newsItem ? {
            title: newsItem.title,
            description: newsItem.description ? newsItem.description.substring(0, 200) : defaultMeta.description,
            image: newsItem.news_images && newsItem.news_images.length > 0
                ? IMAGE_BASE_URL + (newsItem.news_images[0].path.startsWith('/') ? newsItem.news_images[0].path.slice(1) : newsItem.news_images[0].path)
                : defaultMeta.image,
            url: `${SITE_URL}/news/${id}`
        } : defaultMeta;

        // 2. Fetch the frontend's index.html
        // Use a specific User-Agent to avoid self-referencing block issues on some platforms
        const indexRes = await fetch(`${SITE_URL}/index.html`, {
            headers: { 'User-Agent': 'Vercel-SSR-Function' }
        });

        if (!indexRes.ok) {
            throw new Error(`Failed to fetch index.html: ${indexRes.status}`);
        }

        let html = await indexRes.text();

        // 3. Inject Meta Tags
        // Replace Title
        html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);

        // Create Meta Tags Block
        const metaTags = `
    <!-- Dynamic Social Tags -->
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:url" content="${meta.url}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${meta.image}" />
    `;

        // Inject before </head>
        html = html.replace('</head>', `${metaTags}</head>`);

        // 4. Return the Final HTML
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return response.status(200).send(html);

    } catch (error) {
        console.error('SSR Error:', error);

        // Fallback: If we can't fetch index.html, return a basic HTML shell with the meta tags
        // This ensures the link preview still works even if the full app render fails effectively
        const fallbackHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${defaultMeta.title}</title>
                <meta property="og:title" content="${defaultMeta.title}" />
                <meta property="og:description" content="${defaultMeta.description}" />
                <meta property="og:image" content="${defaultMeta.image}" />
                <script>window.location.href = "/";</script>
            </head>
            <body>
                <h1>Redirecting...</h1>
            </body>
            </html>
        `;
        return response.status(200).send(fallbackHtml);
    }
}
