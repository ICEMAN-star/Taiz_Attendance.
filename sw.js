const CACHE_NAME = "taiz-attendance-v10";

const APP_FILES = [
    "./",
    "./manifest.json"
];


/* ===============================
   INSTALL
================================ */

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );

});


/* ===============================
   ACTIVATE
================================ */

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

            .then(() =>
                self.clients.claim()
            )

    );

});


/* ===============================
   FETCH
================================ */

self.addEventListener("fetch", event => {

    const request =
        event.request;

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
     * لا نتدخل إطلاقًا في
     * Google Apps Script
     */

    if (
        url.hostname.includes(
            "script.google.com"
        )
    ) {

        return;

    }


    /*
     * index.html يجب أن يكون
     * Network First.
     *
     * إذا كان الإنترنت موجودًا:
     * نأخذ النسخة الجديدة.
     *
     * إذا لم يوجد الإنترنت:
     * نستخدم النسخة المخزنة.
     */

    if (
        url.origin ===
        self.location.origin
    ) {

        if (
            url.pathname.endsWith(
                "/index.html"
            ) ||
            url.pathname.endsWith("/")
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
         * باقي الملفات:
         * Network First أيضًا.
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
                .catch(() =>
                    caches.match(request)
                )

        );

    }

});


/* ===============================
   FORCE UPDATE
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
