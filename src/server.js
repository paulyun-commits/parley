const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const app = express();

const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));

// Serve the SPA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Proxy any method from /api/* to the Ollama server specified by query param `s`.
// Example: /api/generate?model=x&s=http://ollama-host:11434 
//  -> forwarded to http://ollama-host:11434/api/generate?model=x
app.all('/api/*', (req, res) => {
    // Read server base from query parameter `s`. If absent, default to local Ollama.
    let ollamaBaseUrl = req.query && req.query.s ? String(req.query.s) : 'http://localhost:11434';

    // Basic normalization: ensure protocol present
    if (!/^https?:\/\//i.test(ollamaBaseUrl)) ollamaBaseUrl = 'http://' + ollamaBaseUrl;

    // Strip optional trailing slash for consistent URL resolution
    ollamaBaseUrl = ollamaBaseUrl.replace(/\/+$/, '');

    // Build forward path by removing the leading '/api' prefix from the incoming path
    const ollamaUrlPath = req.path || req.url || '';

    // Rebuild query string excluding `s`
    const ollamaQueryParams = new URLSearchParams();
    Object.entries(req.query || {}).forEach(([k, v]) => {
        if (k === 's') return; // don't forward server param
        if (Array.isArray(v)) v.forEach(val => ollamaQueryParams.append(k, String(val)));
        else if (v !== undefined) ollamaQueryParams.append(k, String(v));
    });

    const ollamaUrl = new URL(ollamaUrlPath, ollamaBaseUrl);
    ollamaUrl.search = ollamaQueryParams.toString();

    const client = ollamaUrl.protocol === 'https:' ? https : http;
    const headers = Object.assign({}, req.headers);
    delete headers.host; // let the client set proper host header

    const options = {
        method: req.method,
        headers,
    };

    const proxyReq = client.request(ollamaUrl, options, (proxyResponse) => {
        res.statusCode = proxyResponse.statusCode || 200;
        Object.entries(proxyResponse.headers || {}).forEach(([k, v]) => {
            if (k.toLowerCase() === 'transfer-encoding') return;
            res.setHeader(k, v);
        });
        proxyResponse.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        if (!res.headersSent) res.status(502).json({ error: 'Bad gateway', detail: err.message });
    });

    // Stream the incoming request body to the target (works for POST/PUT with streaming)
    req.pipe(proxyReq);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});