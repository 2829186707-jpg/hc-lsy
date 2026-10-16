/* HC & LSY 专属空间 - Service Worker (PWA 离线支持) */
const CACHE_NAME = 'hc-lsy-cache-v8';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './icon.svg'
];

// 安装：缓存核心资源
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS).catch(function (err) {
                console.warn('SW cache addAll failed:', err);
            });
        })
    );
    self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) { return k !== CACHE_NAME; })
                    .map(function (k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

// 拦截请求：网络优先 + 5秒超时兜底
// 国内访问 GitHub Pages 偶尔慢/失败：超过 5 秒立即回退缓存，避免页面一直白屏转圈
self.addEventListener('fetch', function (e) {
    // 只处理 GET 请求
    if (e.request.method !== 'GET') return;

    var TIMEOUT_MS = 5000;
    // 超时兜底：网络卡住时快速回退缓存
    var timeoutPromise = new Promise(function (resolve) {
        setTimeout(function () {
            caches.match(e.request).then(function (cached) {
                if (cached) { resolve(cached); return; }
                if (e.request.mode === 'navigate') { caches.match('./index.html').then(function (h) { resolve(h); }); return; }
                resolve(new Response('', { status: 504, statusText: 'Offline' }));
            });
        }, TIMEOUT_MS);
    });

    e.respondWith(
        Promise.race([
            fetch(e.request).then(function (response) {
                // 网络成功：更新缓存并返回
                if (response && response.ok) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            }).catch(function () {
                // 网络失败：尝试从缓存读取
                return caches.match(e.request).then(function (cached) {
                    if (cached) return cached;
                    // 离线且无缓存时，返回首页（单页应用）
                    if (e.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return new Response('', { status: 504, statusText: 'Offline' });
                });
            }),
            timeoutPromise
        ])
    );
});
