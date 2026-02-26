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
    runtimeCaching: defaultCache,
});