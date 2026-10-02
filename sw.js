const CACHE_NAME = "taiz-attendance-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./sw.js"
];

// تثبيت Service Worker وحفظ ملفات التطبيق
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// تفعيل النسخة الجديدة وحذف الكاش القديم
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// التعامل مع طلبات الصفحات والملفات
self.addEventListener("fetch", event => {
  const request = event.request;

  // نتعامل فقط مع GET
  if (request.method !== "GET") {
    return;
  }

  // لا نتدخل في طلبات Google Apps Script أو المواقع الخارجية
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // عند فتح الصفحة: حاول الإنترنت أولاً، ثم الكاش
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put("./index.html", copy));

          return response;
        })
        .catch(() => caches.match("./index.html"))
    );

    return;
  }

  // الملفات الأخرى: الكاش أولاً ثم الإنترنت
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then(response => {
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy));
          }

          return response;
        });
      })
  );
});
