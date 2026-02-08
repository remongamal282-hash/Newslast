
import { spawn } from 'child_process';
import http from 'http';

// Defines the port to run the server on
const PORT = 3001;

// Function to check if meta tags exist in HTML
function checkMetaTags(html) {
    const hasTitle = html.includes('<meta property="og:title"');
    const hasDesc = html.includes('<meta property="og:description"');
    const hasImage = html.includes('<meta property="og:image"');

    console.log('--- Meta Tag Check ---');
    console.log(`Has og:title: ${hasTitle ? '✅' : '❌'}`);
    console.log(`Has og:description: ${hasDesc ? '✅' : '❌'}`);
    console.log(`Has og:image: ${hasImage ? '✅' : '❌'}`);

    if (hasTitle && hasImage) {
        console.log('SUCCESS: SSR is working correctly locally!');
        return true;
    } else {
        console.error('FAILURE: SSR did not inject meta tags.');
        return false;
    }
}

// Start the server
console.log('Starting server.js for testing...');
const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: PORT },
    cwd: process.cwd(),
    stdio: 'pipe'
});

server.stdout.on('data', (data) => {
    console.log(`Server: ${data.toString().trim()}`);
    if (data.toString().includes('Server is running')) {
        // Give it a moment to initialize
        setTimeout(makeRequest, 2000);
    }
});

server.stderr.on('data', (data) => {
    console.error(`Server Error: ${data.toString()}`);
});

function makeRequest() {
    console.log(`Fetching http://localhost:${PORT}/news/1011 ...`);
    http.get(`http://localhost:${PORT}/news/1011`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Response received.');
            // console.log('Response preview:', data.substring(0, 500));

            const success = checkMetaTags(data);

            // Cleanup
            server.kill();
            process.exit(success ? 0 : 1);
        });
    }).on('error', (err) => {
        console.error('Request failed:', err);
        server.kill();
        process.exit(1);
    });
}

// Timeout failsafe
setTimeout(() => {
    console.error('Timeout: Test took too long.');
    server.kill();
    process.exit(1);
}, 15000);
