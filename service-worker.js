const CACHE = "v2.0.1"; // アップデート時はここを変更

// 【対策A】インストールと即時アクティブ化
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        "./",
        "./index.html"
      ])
    )
  );
});

// 【対策A】古いキャッシュの自動削除
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 【対策B】Stale-While-Revalidate（キャッシュを返しつつ裏で更新）
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      const fetchPromise = fetch(e.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE).then(cache => {
            cache.put(e.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
