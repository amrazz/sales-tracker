import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import type { SerwistGlobalConfig } from "serwist";
import { installSerwist } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope &
    SerwistGlobalConfig & {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    };

installSerwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
});