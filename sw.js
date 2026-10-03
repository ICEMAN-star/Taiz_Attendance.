const CACHE_NAME = "taiz-attendance-v99";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    APP_FILES
                );

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        /*
                         * حذف أي Cache قديم
                         */

                        if(
                            key !== CACHE_NAME
                        ){

                            return caches.delete(
                                key
                            );

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


/* =====================================================
   FETCH
===================================================== */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;

        if(
            request.method !== "GET"
        ){
            return;
        }


        const url =
            new URL(
                request.url
            );


        /*
         * لا نحاول تخزين Google Apps Script
         */

        if(
            url.hostname.includes(
                "script.google.com"
            )
        ){
            return;
        }


        /*
         * لا نتعامل مع مواقع خارج GitHub Pages
         */

        if(
            url.origin !==
            self.location.origin
        ){
            return;
        }


        /*
         * index.html والصفحة الرئيسية
         *
         * الشبكة أولاً
         * ثم Cache عند انقطاع الإنترنت
         */

        if(
            url.pathname.endsWith(
                "/"
            ) ||
            url.pathname.endsWith(
                "/index.html"
            )
        ){

            event.respondWith(

                fetch(request, {
                    cache:"no-store"
                })

                .then(response => {

                    if(
                        response &&
                        response.ok
                    ){

                        const copy =
                            response.clone();

                        caches.open(
                            CACHE_NAME
                        )
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

                    return caches.match(
                        request
                    )
                    .then(cached => {

                        if(cached){
                            return cached;
                        }

                        return caches.match(
                            "./index.html"
                        );

                    });

                })

            );

            return;
        }


        /*
         * باقي الملفات
         */

        event.respondWith(

            fetch(request, {
                cache:"no-store"
            })

            .then(response => {

                if(
                    response &&
                    response.ok
                ){

                    const copy =
                        response.clone();

                    caches.open(
                        CACHE_NAME
                    )
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

                return caches.match(
                    request
                );

            })

        );

    }
);


/* =====================================================
   FORCE UPDATE
===================================================== */

self.addEventListener(
    "message",
    event => {

        if(
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ){

            self.skipWaiting();

        }

    }
);
