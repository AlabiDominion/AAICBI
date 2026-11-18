# Local performance check — 16 November 2026

The production build passes, including lint and TypeScript validation. The homepage
and trainee sign-in page render in the local production server. Three targeted
session-request tests pass. Existing lint and PDF-library warnings remain.

## Changes

- Share one session-summary request among public navigation and trainee widgets.
- Load trainee chat/game widgets only for a signed-in trainee; guests do not call
  their polling APIs. Server-side authorization remains in those APIs.
- Defer optional page-help, Loop and install UI until after window load and an
  idle opportunity. The offline status indicator stays available immediately.
- Disable automatic route prefetch for the public header's section navigation.
- Prevent overlapping chat/game polling requests on slow connections.
- Reuse the homepage's ecosystem switches in its child view, and run independent
  landing-page reads concurrently instead of serially.

## Measurements

Anonymous requests to a warm local production server, before and after. These are
individual HTTP samples, not mobile-browser LCP measurements or load tests.
Initial JavaScript size sums gzip estimates for script tags in the HTML; it does
not include later dynamic imports, images, API payloads or speculative prefetches.

| Measurement | Before | After |
| --- | ---: | ---: |
| Sign-in complete HTML response | 279 ms | 149 ms |
| Homepage complete HTML response | 15,109 ms | 9,751 ms |
| Sign-in initial JavaScript, gzip estimate | 244,749 bytes | 243,119 bytes |
| Homepage initial JavaScript, gzip estimate | 235,639 bytes | 234,009 bytes |

The bundle reduction is small (about 0.7%). The main client changes avoid unused
background downloads and calls, rather than removing features. The homepage
timing improvement was measured with native database connections failing on both
versions; it is not a prediction of latency with a healthy database. The page
shows fallback content until the database connection works.

Repeat after starting a production build:

```sh
node scripts/measure-public-pages.mjs http://127.0.0.1:3000
```

## Neon diagnosis

- DNS resolves and a TCP connection to the configured endpoint can open.
- PostgreSQL's SSL negotiation receives no response in the diagnostic test.
- Prisma's read-only `SELECT 1` fails, including with a longer connection timeout.
- The same configured database connection succeeds with `SELECT 1` through
  Neon's official HTTPS driver, installed separately outside the application.

The database and credentials are valid. The native PostgreSQL transport from this
computer remains unresolved. Inspect the network/VPN/firewall path and repeat the
native connection test on the VPS; the local result does not establish the VPS's
network behavior. No application driver or schema migration was changed.

## Remaining verification

Fix native database connectivity before benchmarking the real feed, successful
sign-in, dashboards or query latency. Check VPS RAM/CPU, Docker resource limits,
kernel OOM messages and free disk during a build to establish the crash cause.
The prior unmodified local build peaked at approximately 2.54 GiB of sampled
process-tree working set; this Windows measurement is not a Linux capacity guarantee.
