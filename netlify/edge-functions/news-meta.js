export default async (request, context) => {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    // Configuration
    const API_URL = 'https://backend.ascww.org/api/news';
    const IMAGE_BASE_URL = 'https://backend.ascww.org/api/news/image/';

    // Default values incase of error
    const defaultMeta = {
        title: "شركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد",
        description: "الموقع الرسمي لشركة مياه الشرب والصرف الصحي بأسيوط والوادي الجديد - تابع أحدث الأخبار والخدمات",
        image: `${url.origin}/logo.png`,
        url: url.href
    };

    try {
        // 1. Fetch News Data
        const apiRes = await fetch(API_URL);
        let newsItem = null;

        if (apiRes.ok) {
            const newsList = await apiRes.json();
            newsItem = newsList.find(item => item.id == id);
        }

        // Prepare Meta Data
        const meta = newsItem ? {
            title: newsItem.title,
            description: newsItem.description ? newsItem.description.substring(0, 200) : defaultMeta.description,
            image: newsItem.news_images && newsItem.news_images.length > 0
                ? IMAGE_BASE_URL + (newsItem.news_images[0].path.startsWith('/') ? newsItem.news_images[0].path.slice(1) : newsItem.news_images[0].path)
                : defaultMeta.image,
            url: url.href
        } : defaultMeta;

        // 2. Get the next response (which should be index.html due to _redirects)
        const response = await context.next();
        const page = await response.text();

        // 3. Inject Meta Tags
        let html = page;

        // Replace Title
        html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);

        // Clean description
        const cleanDesc = meta.description
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const safeDescription = cleanDesc.substring(0, 200).replace(/"/g, '&quot;');

        // Create Meta Tags Block with Facebook-required properties
        const metaTags = `
    <!-- Dynamic Social Tags -->
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
    <meta name="twitter:image" content="${meta.image}" />
    `;

        // Inject before </head>
        html = html.replace('</head>', `${metaTags}</head>`);

        return new Response(html, response);

    } catch (error) {
        console.error("Edge Function Error:", error);
        return context.next();
    }
};
