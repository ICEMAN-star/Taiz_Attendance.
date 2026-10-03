const CACHE_NAME = "taiz-attendance-v11";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];


self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache =>
                cache.addAll(APP_FILES)
            )
            .then(() =>
                self.skipWaiting()
            )

    );

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys =>

                Promise.all(

                    keys.map(key => {

                        if (
                            key.startsWith(
                                "taiz-attendance-"
                            ) &&
                            key !== CACHE_NAME
                        ) {

                            return caches.delete(key);

                        }

                    })

                )

            )
            .then(() =>
                self.clients.claim()
            )

    );

});


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
     * لا نخزن Google Apps Script
     */

    if (
        url.hostname.includes(
            "script.google.com"
        )
    ) {

        return;

    }


    if (
        url.origin !==
        self.location.origin
    ) {

        return;

    }


    /*
     * الصفحة الرئيسية:
     * Network First
     *
     * حتى لا نعرض نسخة قديمة عند توفر الإنترنت.
     */

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
                .catch(() =>

                    caches.match(
                        request
                    )

                )

        );

        return;

    }


    /*
     * بقية الملفات:
     * Network First
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

                caches.match(
                    request
                )

            )

    );

});


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
