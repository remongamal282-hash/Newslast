export default async function handler(request, response) {
    const { id } = request.query;

    // Configuration
    const API_URL = 'https://backend.ascww.org/api/news';
    const IMAGE_BASE_URL = 'https://backend.ascww.org/api/news/image/';
    const SITE_URL = 'https://' + process.env.VERCEL_URL; // VERCEL_URL is domain without protocol

    // Default Meta Data
    const defaultMeta = {
        title: "شركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد",
        description: "الموقع الرسمي لشركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد - تابع أحدث الأخبار والخدمات",
        image: `${SITE_URL}/logo.png`, // Assuming logo.png is in public folder. If not, use a different default.
        url: SITE_URL
    };

    try {
        // 1. Fetch News Data
        // We fetch the full list because the API doesn't support single item by ID publicly (as per client code analysis)
        const apiRes = await fetch(API_URL);
        if (!apiRes.ok) throw new Error('Failed to fetch news data');
        const newsList = await apiRes.json();

        // Find the specific news item
        const newsItem = newsList.find(item => item.id == id);

        // Prepare Meta Data
        const meta = newsItem ? {
            title: newsItem.title,
            description: newsItem.description ? newsItem.description.substring(0, 200) : defaultMeta.description, // Truncate description
            image: newsItem.news_images && newsItem.news_images.length > 0
                ? IMAGE_BASE_URL + (newsItem.news_images[0].path.startsWith('/') ? newsItem.news_images[0].path.slice(1) : newsItem.news_images[0].path)
                : defaultMeta.image,
            url: `${SITE_URL}/news/${id}`
        } : defaultMeta;

        // 2. Fetch the frontend's index.html
        // We fetch it from our own deployment to get the correct hashed assets (JS/CSS)
        // Note: We use the SITE_URL specific to this deployment
        const indexRes = await fetch(`${SITE_URL}/index.html`);
        if (!indexRes.ok) throw new Error('Failed to fetch index.html');
        let html = await indexRes.text();

        // 3. Inject Meta Tags
        // We replace the <title> and inject Open Graph tags into the <head>

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
        response.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate'); // Cache lightly
        return response.status(200).send(html);

    } catch (error) {
        console.error('SSR Error:', error);
        // In case of error (e.g. API down), fallback to serving the plain index.html logic
        // We can try to redirect to index.html or just return a basic "Not Found" if critical
        // Ideally, we redirect to the client-side route so the client can handle the 404 UI
        // But redirection changes URL.
        // Better: Fetch index.html and return it without dynamic tags (or with defaults)
        try {
            const indexRes = await fetch(`${SITE_URL}/index.html`);
            const html = await indexRes.text();
            return response.status(200).send(html);
        } catch (e) {
            return response.status(500).send('Internal Server Error');
        }
    }
}
