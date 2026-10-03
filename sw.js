const CACHE_NAME =
    "taiz-attendance-v99";


const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    cache =>
                        cache.addAll(
                            APP_FILES
                        )
                )
                .then(
                    () =>
                        self.skipWaiting()
                )
        );
    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    keys =>
                        Promise.all(

                            keys.map(
                                key => {

                                    if(
                                        key !==
                                        CACHE_NAME
                                    ){

                                        return caches.delete(
                                            key
                                        );
                                    }

                                    return Promise.resolve();
                                }
                            )
                        )
                )
                .then(
                    () =>
                        self.clients.claim()
                )
        );
    }
);


self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;

        if(
            request.method !==
            "GET"
        ){
            return;
        }

        const url =
            new URL(
                request.url
            );


        /*
         * لا نتدخل في Google Apps Script.
         */

        if(
            url.hostname.includes(
                "script.google.com"
            )
        ){
            return;
        }


        /*
         * لا نتدخل في مواقع خارج GitHub Pages.
         */

        if(
            url.origin !==
            self.location.origin
        ){
            return;
        }


        event.respondWith(

            fetch(
                request,
                {
                    cache:
                        "no-store"
                }
            )
            .then(
                response => {

                    if(
                        response &&
                        response.ok
                    ){

                        const copy =
                            response.clone();

                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                cache =>
                                    cache.put(
                                        request,
                                        copy
                                    )
                            );
                    }

                    return response;
                }
            )
            .catch(
                () =>
                    caches
                        .match(
                            request
                        )
                        .then(
                            cached => {

                                if(
                                    cached
                                ){
                                    return cached;
                                }

                                return caches.match(
                                    "./index.html"
                                );
                            }
                        )
            )
        );
    }
);


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
