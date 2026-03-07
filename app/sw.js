import { defaultCache } from "@serwist/next/worker";
import { PrecacheEntry } from "@serwist/precaching";
import { SerwistGlobalConfig } from "serwist";
import { installSerwist } from "@serwist/sw";

self.__SW_MANIFEST = self.__SW_MANIFEST || [];

installSerwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts",
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
                },
            },
        },
        {
            matcher: /\/api\/.*$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "api-cache",
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        ...defaultCache,
    ],
});