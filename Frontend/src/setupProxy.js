// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');
// "proxy": [
//     "http://localhost:3002",
//     "http://localhost:3000",
//     "http://localhost:3001"
//   ],

module.exports = function(app) {
    app.use(
        'http://10.42.131.20:3002/deepgram', // First API endpoint
        createProxyMiddleware({
            target: 'http://localhost:3002', // Target server
            changeOrigin: true,
        })
    );
    app.use(
        'http://10.42.131.20:3002/gemini', // Second API endpoint
        createProxyMiddleware({
            target: 'http://localhost:3000', // Another target server
            changeOrigin: true,
        })
    );
};
