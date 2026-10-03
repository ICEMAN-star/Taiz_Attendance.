const CACHE_NAME = "taiz-attendance-v20";

const APP_FILES = [
    "./index.html",
    "./manifest.json"
];


/* ================================
   INSTALL
================================ */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_FILES);

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        /*
                         * حذف جميع النسخ القديمة
                         */

                        if (
                            key.startsWith("taiz-attendance-") &&
                            key !== CACHE_NAME
                        ) {

                            return caches.delete(key);

                        }

                        return Promise.resolve();

                    })

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", event => {

    const request =
        event.request;


    /*
     * نهتم فقط بطلبات GET
     */

    if (
        request.method !== "GET"
    ) {

        return;

    }


    const url =
        new URL(request.url);


    /*
     * لا نتدخل في Google Apps Script
     */

    if (
        url.hostname.includes(
            "script.google.com"
        )
    ) {

        return;

    }


    /*
     * فقط ملفات GitHub Pages
     */

    if (
        url.origin !==
        self.location.origin
    ) {

        return;

    }


    /*
     * الصفحة الرئيسية
     *
     * Online:
     * نحاول أخذ أحدث نسخة من GitHub.
     *
     * Offline:
     * نستخدم آخر نسخة محفوظة.
     */

    if (
        url.pathname.endsWith(
            "/"
        ) ||
        url.pathname.endsWith(
            "/index.html"
        )
    ) {

        event.respondWith(

            fetch(request)

                .then(response => {

                    if (
                        response &&
                        response.ok
                    ) {

                        const copy =
                            response.clone();

                        caches.open(
                            CACHE_NAME
                        ).then(cache => {

                            cache.put(
                                request,
                                copy
                            );

                        });

                    }

                    return response;

                })

                .catch(() => {

                    return caches.match(
                        request
                    );

                })

        );

        return;

    }


    /*
     * باقي الملفات
     */

    event.respondWith(

        fetch(request)

            .then(response => {

                if (
                    response &&
                    response.ok
                ) {

                    const copy =
                        response.clone();

                    caches.open(
                        CACHE_NAME
                    ).then(cache => {

                        cache.put(
                            request,
                            copy
                        );

                    });

                }

                return response;

            })

            .catch(() => {

                return caches.match(
                    request
                );

            })

    );

});


/* ================================
   الرسائل
================================ */

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
