import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ssrHandler from './api/ssr.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SSR Route for news details
// This matches the rewrite rule in vercel.json
app.get('/news/:id', async (req, res) => {
    try {
        // Adapt Express req/res to Vercel-like handler if needed,
        // but usually they are compatible enough for this simple usage.
        // Create a proxy to inject 'id' into query safely without mutating the original req
        const reqWrapper = new Proxy(req, {
            get(target, prop) {
                if (prop === 'query') {
                    return { ...target.query, id: target.params.id };
                }
                return Reflect.get(target, prop);
            }
        });

        await ssrHandler(reqWrapper, res);
    } catch (error) {
        console.error('Error in SSR route:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Fallback for all other routes - serve index.html (SPA support)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`SSR is active for /news/:id routes`);
});
// last commit 8-2-2026 12:45