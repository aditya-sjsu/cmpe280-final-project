// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');
// "proxy": [
//     "http://localhost:3002",
//     "http://localhost:3000",
//     "http://localhost:3001"
//   ],

module.exports = function(app) {
    app.use(
        '/deepgram',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
        })
    );
    app.use(
        '/gemini',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
        })
    );
    app.use(
        '/lmnt',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
        })
    );
};
