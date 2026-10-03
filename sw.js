const CACHE_NAME = "taiz-attendance-v9";


/*
=========================================================
ملفات التطبيق التي سيتم تخزينها محليًا
=========================================================
*/

const APP_FILES = [
    "./",
    "./index.html",
    "./admin.html",
    "./manifest.json"
];


/*
=========================================================
INSTALL
يحدث عند تثبيت Service Worker
=========================================================
*/

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)

                .then(cache => {

                    return cache.addAll(
                        APP_FILES
                    );

                })

                .then(() => {

                    return self.skipWaiting();

                })

        );

    }
);


/*
=========================================================
ACTIVATE
حذف النسخ القديمة من Cache
=========================================================
*/

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()

                .then(keys => {

                    return Promise.all(

                        keys.map(key => {

                            if (
                                key !== CACHE_NAME
                            ) {

                                return caches.delete(
                                    key
                                );

                            }

                            return null;

                        })

                    );

                })

                .then(() => {

                    return self.clients.claim();

                })

        );

    }
);


/*
=========================================================
FETCH
التعامل مع طلبات الملفات
=========================================================
*/

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;

        /*
        لا نتعامل مع POST
        */
        if (
            request.method !== "GET"
        ) {

            return;
        }


        const url =
            new URL(
                request.url
            );


        /*
        مهم جدًا:

        لا نخزن أو نعترض طلبات
        Google Apps Script
        */

        if (
            url.hostname.includes(
                "script.google.com"
            )
        ) {

            return;
        }


        /*
        الطلبات الخاصة بالتطبيق نفسه
        */

        if (
            url.origin ===
            self.location.origin
        ) {

            event.respondWith(

                fetch(request)

                    .then(response => {

                        /*
                        إذا نجح الاتصال
                        نضع نسخة في Cache
                        */

                        if (
                            response &&
                            response.ok
                        ) {

                            const copy =
                                response.clone();

                            caches
                                .open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        copy
                                    );

                                });

                        }

                        return response;

                    })

                    .catch(() => {

                        /*
                        إذا انقطع الإنترنت
                        نستخدم النسخة المخزنة
                        */

                        return caches.match(
                            request
                        );

                    })

            );

        }

    }
);


/*
=========================================================
رسالة لتحديث Service Worker
=========================================================
*/

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);
