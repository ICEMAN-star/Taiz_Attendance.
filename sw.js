const CACHE_NAME = "taiz-attendance-v7";

const APP_FILES = [
  "./",
  "./index.html"
];

// تثبيت النسخة الجديدة
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// تفعيل النسخة الجديدة وحذف جميع النسخ القديمة
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// التعامل مع طلبات الملفات
self.addEventListener("fetch", event => {

  // لا نتعامل مع POST أو الطلبات غير GET
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    // نحاول الحصول على النسخة الحديثة من الإنترنت أولاً
    fetch(event.request)

      .then(response => {

        if (response && response.ok) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copy);
            });
        }

        return response;
      })

      // إذا لم يوجد إنترنت نستخدم النسخة المخزنة
      .catch(() => {
        return caches.match(event.request);
      })

  );
});
