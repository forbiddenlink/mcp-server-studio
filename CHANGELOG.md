# Changelog

## [1.0.3](https://github.com/forbiddenlink/mcp-server-studio/compare/v1.0.2...v1.0.3) (2026-09-02)


### Bug Fixes

* **ci:** let pnpm/action-setup read the version from packageManager ([526948b](https://github.com/forbiddenlink/mcp-server-studio/commit/526948b126769a712647eb43333e34b244af67de))
* **deps:** give every resolution override an upper bound ([2c7fab6](https://github.com/forbiddenlink/mcp-server-studio/commit/2c7fab666aea2626e52f6743bf47789b85d82bd8))

## [1.0.2](https://github.com/forbiddenlink/mcp-server-studio/compare/v1.0.1...v1.0.2) (2026-09-01)


### Bug Fixes

* **build:** drop the dead upstash client that broke type checking ([e6429ec](https://github.com/forbiddenlink/mcp-server-studio/commit/e6429ecadf3cd0b72fbc9ada8b4eec72951bb7e9))

## [1.0.1](https://github.com/forbiddenlink/mcp-server-studio/compare/v1.0.0...v1.0.1) (2026-08-29)


### Bug Fixes

* **deps:** move resolution overrides to package.json and add missing patches ([#72](https://github.com/forbiddenlink/mcp-server-studio/issues/72)) ([7e5e0cd](https://github.com/forbiddenlink/mcp-server-studio/commit/7e5e0cdf02334a971c5f73ca8b4853516d359940))

## 1.0.0 (2026-08-17)


### Features

* wiring-studio visual system ([6369d7b](https://github.com/forbiddenlink/mcp-server-studio/commit/6369d7bd6206893863508abb7f7955a8c867268d))


### Bug Fixes

* **a11y,lint:** resolve 31 biome errors surfaced by v2 migration ([2ded86f](https://github.com/forbiddenlink/mcp-server-studio/commit/2ded86faf9026bded84040c94a502708774dc484))
* add missing Sentry import and remove env.ts import in next.config ([540676e](https://github.com/forbiddenlink/mcp-server-studio/commit/540676eea2372faeabb44c66508733ed9c1ab0f0))
* add zod dependency to resolve module not found error ([78aad47](https://github.com/forbiddenlink/mcp-server-studio/commit/78aad47b243af220a49da31973b0fb7d4b0c0bf9))
* **ci:** fix pnpm-workspace.yaml YAML syntax ([6c4b4d4](https://github.com/forbiddenlink/mcp-server-studio/commit/6c4b4d40ec8cc29e92d7cbaf0a3d37d70e41f402))
* **deps:** pin undici &gt;=7.28.0 &lt;8 (CVE-2026-12151 floor, avoid v8 break) ([cf1b317](https://github.com/forbiddenlink/mcp-server-studio/commit/cf1b317514abd854ac6826465652376ba51911f1))
* env.ts import, sentry paths, MSW types, safe-action api ([b199a5e](https://github.com/forbiddenlink/mcp-server-studio/commit/b199a5ec395d1f92cd907721d9b7ff4d46c510df))
* land sec-sweep-v3 — a11y CI + remove duplicate renovate.json ([#50](https://github.com/forbiddenlink/mcp-server-studio/issues/50)) ([da8640f](https://github.com/forbiddenlink/mcp-server-studio/commit/da8640fc93bcedbd96e7d9ae913579f8e4501d8b))
* migrate pnpm overrides from package.json to pnpm-workspace.yaml ([d1be09d](https://github.com/forbiddenlink/mcp-server-studio/commit/d1be09d0c2154d3f861f4a5a37bf7045e4be0f57))
* override dompurify to ^3.3.2 to patch security advisory ([a985ab3](https://github.com/forbiddenlink/mcp-server-studio/commit/a985ab3f58d3a2c5a0028c6c56b0e29db2bf3f2a))
* patch 13 security vulnerabilities ([2fb75b5](https://github.com/forbiddenlink/mcp-server-studio/commit/2fb75b513a52a3ec7edbac75ea0610c0e8646729))
* remove unavailable socketsecurity/socket-action from security workflow ([d8315fa](https://github.com/forbiddenlink/mcp-server-studio/commit/d8315fa5c7a8b30cb23cd5d560d1ccc460db0f2b))
* resolve build errors ([a631cee](https://github.com/forbiddenlink/mcp-server-studio/commit/a631cee056486ba6b217aa7193f3888482dc9200))
* resolve undici v8/jsdom incompatibility and vitest path alias ([#49](https://github.com/forbiddenlink/mcp-server-studio/issues/49)) ([0825d95](https://github.com/forbiddenlink/mcp-server-studio/commit/0825d953d87b1ee0268acf76fcabf9d49dffa48f))
* sec sweep v3 tier 2 - pin fast-uri/lodash/undici/uuid ([#29](https://github.com/forbiddenlink/mcp-server-studio/issues/29)) ([c4352fa](https://github.com/forbiddenlink/mcp-server-studio/commit/c4352fab93a1d107630c499cb191b8ec40ecb55d))
* **security:** pin transitive deps to patched versions (Dependabot high alerts) ([46d9bbc](https://github.com/forbiddenlink/mcp-server-studio/commit/46d9bbcd86f850dabe19fae768763ea2a0b90b65))
