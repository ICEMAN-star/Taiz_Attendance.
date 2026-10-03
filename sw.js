const CACHE_NAME =
  "taiz-attendance-v10";


const APP_FILES = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json"
];


/* =====================================================
   INSTALL
   ===================================================== */

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


/* =====================================================
   ACTIVATE
   ===================================================== */

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

                  if (
                    key !==
                    CACHE_NAME
                  ) {

                    return caches.delete(
                      key
                    );

                  }

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


/* =====================================================
   FETCH
   ===================================================== */

self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;


    /*
     * لا نعترض POST.
     */

    if (
      request.method !==
      "GET"
    ) {

      return;

    }


    /*
     * Google Apps Script
     * يذهب مباشرة إلى الشبكة.
     */

    if (
      request.url.includes(
        "script.google.com"
      )
    ) {

      return;

    }


    event.respondWith(

      fetch(request)

        .then(
          response => {

            if (
              response &&
              response.ok
            ) {

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
            caches.match(
              request
            )
        )

    );

  }
);
