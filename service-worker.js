/* HC & LSY 专属空间 - Service Worker (PWA 离线支持) */
const CACHE_NAME = 'hc-lsy-cache-v4';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './icon.svg',
    './data/app-data.json'
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

// 拦截请求：缓存优先，网络回退
self.addEventListener('fetch', function (e) {
    // 只处理 GET 请求
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(function (cached) {
            // 有缓存直接返回，同时后台更新
            if (cached) {
                fetch(e.request).then(function (response) {
                    if (response && response.ok) {
                        var clone = response.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(e.request, clone);
                        });
                    }
                }).catch(function () {});
                return cached;
            }
            // 无缓存，从网络获取并缓存
            return fetch(e.request).then(function (response) {
                if (response && response.ok) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            }).catch(function () {
                // 离线且无缓存时，返回首页（单页应用）
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('', { status: 504, statusText: 'Offline' });
            });
        })
    );
});
