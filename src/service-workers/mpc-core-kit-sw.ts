/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

export const mpcCoreKitServiceWorker = () => {
  /* eslint-disable */
  function getScope() {
    return self.registration.scope
  }

  self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }
  })

  self.addEventListener('fetch', function (event) {
    try {
      const url = new URL(event.request.url)
      //@ts-expect-error
      const redirectURL = self.location.url
      if (url.pathname.includes('redirect') && url.href.includes(getScope())) {
        event.respondWith(
          new Response(
            new Blob(
              [
                `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
                    <title>Redirect</title>
                    <style>
                      * {
                        box-sizing: border-box;
                      }

                      html,
                      body {
                        background: #fcfcfc;
                        height: 100%;
                        padding: 0;
                        margin: 0;
                      }

                      .container {
                        width: 100%;
                        height: 100%;

                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                      }

                      h1.title {
                        font-size: 14px;
                        color: #0f1222;
                        font-family: "Roboto", sans-serif !important;
                        margin: 0;
                        text-align: center;
                      }

                      .spinner .beat {
                        background-color: #0364ff;
                        height: 12px;
                        width: 12px;
                        margin: 24px 2px 10px;
                        border-radius: 100%;
                        -webkit-animation: beatStretchDelay 0.7s infinite linear;
                        animation: beatStretchDelay 0.7s infinite linear;
                        -webkit-animation-fill-mode: both;
                        animation-fill-mode: both;
                        display: inline-block;
                      }

                      .spinner .beat-odd {
                        animation-delay: 0s;
                      }

                      .spinner .beat-even {
                        animation-delay: 0.35s;
                      }

                      @-webkit-keyframes beatStretchDelay {
                        50% {
                          -webkit-transform: scale(0.75);
                          transform: scale(0.75);
                          -webkit-opacity: 0.2;
                          opacity: 0.2;
                        }

                        100% {
                          -webkit-transform: scale(1);
                          transform: scale(1);
                          -webkit-opacity: 1;
                          opacity: 1;
                        }
                      }

                      @keyframes beatStretchDelay {
                        50% {
                          -webkit-transform: scale(0.75);
                          transform: scale(0.75);
                          -webkit-opacity: 0.2;
                          opacity: 0.2;
                        }

                        100% {
                          -webkit-transform: scale(1);
                          transform: scale(1);
                          -webkit-opacity: 1;
                          opacity: 1;
                        }
                      }

                      @media (min-width: 768px) {
                        h1.title {
                          font-size: 14px;
                        }
                        p.info {
                          font-size: 28px;
                        }

                        .spinner .beat {
                          height: 12px;
                          width: 12px;
                        }
                      }
                    </style>
                  </head>

                  <body>
                    <div id="message" class="container">
                      <div class="spinner content" id="spinner">
                        <div class="beat beat-odd"></div>
                        <div class="beat beat-even"></div>
                        <div class="beat beat-odd"></div>
                      </div>
                      <h1 class="title content" id="closeText" style="display: none;">You can close this window now</h1>
                    </div>
                    <script
                    src="https://scripts.toruswallet.io/broadcastChannel_6_0_0.js"
                    integrity="sha384-tWiIvEY4iDOl9h6tNeoxETpLfPxq0tgzbIXFYjok42Gu5KoDaA9uSiAk2nG6XBcp"
                    crossorigin="anonymous"
                  ></script>
                    <script>
                      function storageAvailable(type) {
                        var storage;
                        try {
                          storage = window[type];
                          var x = "__storage_test__";
                          storage.setItem(x, x);
                          storage.removeItem(x);
                          return true;
                        } catch (e) {
                          return (
                            e &&
                            // everything except Firefox
                            (e.code === 22 ||
                              // Firefox
                              e.code === 1014 ||
                              // test name field too, because code might not be present
                              // everything except Firefox
                              e.name === "QuotaExceededError" ||
                              // Firefox
                              e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
                            // acknowledge QuotaExceededError only if there's something already stored
                            storage &&
                            storage.length !== 0
                          );
                        }
                      }
                      function showCloseText() {
                        var closeText = document.getElementById("closeText");
                        var spinner = document.getElementById("spinner");
                        if (closeText) {
                          closeText.style.display = "block";
                        }
                        if (spinner) {
                          spinner.style.display = "none";
                        }
                      }
                      var isLocalStorageAvailable = storageAvailable("localStorage");
                      var isSessionStorageAvailable = storageAvailable("sessionStorage");
                      // set theme
                      let theme = "light";
                      if (isLocalStorageAvailable) {
                        var torusTheme = localStorage.getItem("torus-theme");
                        if (torusTheme) {
                          theme = torusTheme.split("-")[0];
                        }
                      }

                      if (theme === "dark") {
                        document.querySelector("body").style.backgroundColor = "#24252A";
                      }
                      var bc;
                      var broadcastChannelOptions = {
                        // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node'
                        webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increase performance)
                      };
                      var instanceParams = {};
                      var preopenInstanceId = new URL(window.location.href).searchParams.get("preopenInstanceId");
                      if (!preopenInstanceId) {
                        document.getElementById("message").style.visibility = "visible";
                        // in general oauth redirect
                        try {
                          var url = new URL(location.href);
                          var hash = url.hash.substr(1);
                          var hashParams = {};
                          if (hash) {
                            hashParams = hash.split("&").reduce(function (result, item) {
                              var parts = item.split("=");
                              result[parts[0]] = parts[1];
                              return result;
                            }, {});
                          }
                          var queryParams = {};
                          for (var key of url.searchParams.keys()) {
                            queryParams[key] = url.searchParams.get(key);
                          }
                          var error = "";
                          try {
                            if (Object.keys(hashParams).length > 0 && hashParams.state) {
                              instanceParams = JSON.parse(window.atob(decodeURIComponent(decodeURIComponent(hashParams.state)))) || {};
                              if (hashParams.error) error = hashParams.error;
                            } else if (Object.keys(queryParams).length > 0 && queryParams.state) {
                              instanceParams = JSON.parse(window.atob(decodeURIComponent(decodeURIComponent(queryParams.state)))) || {};
                              if (queryParams.error) error = queryParams.error;
                            }
                          } catch (e) {
                            console.error(e);
                          }
                          if (instanceParams.redirectToOpener) {
                            // communicate to window.opener
                            window.opener.postMessage(
                              {
                                channel: "redirect_channel_" + instanceParams.instanceId,
                                data: {
                                  instanceParams: instanceParams,
                                  hashParams: hashParams,
                                  queryParams: queryParams,
                                },
                                error: error,
                              },
                              "${redirectURL}"
                            );
                          } else {
                            // communicate via broadcast channel
                            bc = new broadcastChannelLib.BroadcastChannel("redirect_channel_" + instanceParams.instanceId, broadcastChannelOptions);
                            bc.addEventListener("message", function (ev) {
                              if (ev.success) {
                                bc.close();
                              } else {
                                window.close();
                                showCloseText();
                              }
                            });
                            bc.postMessage({
                              data: {
                                instanceParams: instanceParams,
                                hashParams: hashParams,
                                queryParams: queryParams,
                              },
                              error: error,
                            }).then(function () {
                              setTimeout(function () {
                                window.location.href = url.origin + location.search + location.hash;
                              }, 5000);
                            });
                          }
                        } catch (err) {
                          console.error(err, "service worker error in redirect");
                          bc && bc.close();
                          window.close();
                          showCloseText();
                        }
                      } else {
                        // in preopen, awaiting redirect
                        try {
                          bc = new broadcastChannelLib.BroadcastChannel("preopen_channel_" + preopenInstanceId, broadcastChannelOptions);
                          bc.onmessage = function (ev) {
                            var { preopenInstanceId: oldId, payload, message } = ev.data;
                            if (oldId === preopenInstanceId && payload && payload.url) {
                              window.location.href = payload.url;
                            } else if (oldId === preopenInstanceId && message === "setup_complete") {
                              bc.postMessage({
                                data: {
                                  preopenInstanceId: preopenInstanceId,
                                  message: "popup_loaded",
                                },
                              });
                            }
                            if (ev.error && ev.error !== "") {
                              console.error(ev.error);
                              bc.close();
                            }
                          };
                        } catch (err) {
                          console.error(err, "service worker error in preopen");
                          bc && bc.close();
                          window.close();
                          showCloseText();
                        }
                      }
                    </script>
                  </body>
                </html>
                                        
                ${''}
                  `,
              ],
              { type: 'text/html' },
            ),
          ),
        )
      }
    } catch (error) {
      console.error(error)
    }
  })
}
