# Generated code guarantees

Snapshot as of 2026-11-02, written against commit `d046eaa` (main). If `main` has moved, re-check the file and test references below before you rely on them.

This page tells you what a server exported from MCP Server Studio does and does not guarantee. Each statement comes from reading the generators in `lib/generators/`, the sanitizers in `lib/utils/sanitize.ts`, and their tests. Where a test covers a statement, the test file is named.

## How to read the tests

Every generator test listed here checks the generated text. The tests call a generator, then assert that the output string contains an expected fragment, or that parsed JSON has an expected field. No test in the repository compiles an exported server with `tsc`, installs its dependencies, starts it, or connects an MCP client to it. "A test covers it" therefore means "the generator emits this text", not "the exported server behaves this way when run".

## Guaranteed: a test covers it

Paths are relative to `lib/generators/__tests__/` unless stated.

| # | What the generator emits | Test file |
|---|---|---|
| 1 | A stdio server imports `StdioServerTransport` and starts it in `main()`. | `mcpServerGenerator.test.ts` |
| 2 | An HTTP server imports Express and the SSE transport, and defines a `/health` endpoint, an `/sse` endpoint and a `/messages` endpoint on the configured port. | `mcpServerGenerator.test.ts` |
| 3 | Each tool is registered with `server.tool(...)` under a snake_case id, with a Zod schema built from its parameters. Optional parameters get `.optional()` and parameters with a default get `.default(...)`. | `mcpServerGenerator.test.ts` |
| 4 | Parameter constraints become Zod calls in the exported source: `z.enum`, `.email()`, `.url()`, `.uuid()`, `.min()`/`.max()` for numbers and strings, `.regex`, and array bounds. | `constraints.test.ts` |
| 5 | Each tool handler wraps its body in `try/catch` and returns `isError: true` on a thrown error. | `mcpServerGenerator.test.ts` |
| 6 | Resources and prompts are registered with `server.resource(...)` and `server.prompt(...)`, and the matching `resources` and `prompts` capabilities appear. | `mcpServerGenerator.test.ts` |
| 7 | A tool with sampling enabled gets a `createMessage` call and a `sampling` capability. A tool with elicitation enabled gets an `elicitInput` call (form and URL modes) and an `elicitation` capability. | `mcpServerGenerator.test.ts` |
| 8 | The generated manifest carries the same constraints as JSON Schema (enum, format, bounds, pattern, array limits, default). | `constraints.test.ts`, `manifestGenerator.test.ts` |
| 9 | A double quote inside a parameter description is escaped in the generated source. The sanitizer helpers (`escapeTemplateLiteral`, `escapeDoubleQuoted`, `sanitizeIdentifier`, `escapeMarkdown`) behave as their unit tests state. | `mcpServerGenerator.test.ts`, `lib/utils/__tests__/sanitize.test.ts` |
| 10 | The `typescript` export is one file, `index.ts`. The `docker` export includes `Dockerfile`, `.dockerignore`, `docker-compose.yml` and `src/index.ts`. The `railway` export includes `railway.json`, `railway.toml`, `.env.railway`, `DEPLOY.md` and `src/index.ts`. Both include `package.json` and `tsconfig.json`. | `exportBundler.test.ts` |
| 11 | The Docker and Railway exports include a `claude_desktop_config.json` that contains `mcpServers`. | `constraints.test.ts` |
| 12 | The Dockerfile is multi-stage, creates a non-root `mcpuser` and switches to it, and sets `NODE_ENV=production`. It adds `EXPOSE` and `HEALTHCHECK` for HTTP transport only. | `dockerGenerator.test.ts` |
| 13 | The generated `package.json` lists the MCP SDK, Zod and TypeScript. It adds Express and CORS for HTTP transport only, sets a minimum Node version, and has a `bin` entry. The `tsconfig.json` uses `NodeNext` module resolution. | `readmeGenerator.test.ts` |
| 14 | The Railway config sets the build and start commands and, for HTTP transport, a `/health` health check. | `railwayGenerator.test.ts` |
| 15 | The ZIP builder returns a non-empty `application/zip` blob for flat and nested file paths. | `zipCreator.test.ts` |
| 16 | The generated README documents enum values, format, number range, string length and default values. | `constraints.test.ts` |

That is 16 statements, each with a named test file.

## Generated but not tested

The generators produce these, and no test asserts them.

- **The exported source compiles.** No test runs `tsc` on generator output. The `mcpServerGenerator.test.ts` case named "generates valid code for config with all entity types" checks that three registration calls appear in the text, not that the code is valid.
- **The exported server starts and answers MCP requests.** No test starts one.
- **Handlers return placeholder results.** Each tool handler contains `// TODO: Implement ... logic here` and returns a fixed "executed successfully" message (`mcpServerGenerator.ts` lines 313-322). Resources return the literal text "Resource content goes here" and prompts return the prompt description. You write the real behavior.
- **Tasks configuration.** A tool with tasks enabled adds a "Tasks (async)" line to its doc comment. The generator emits no task-handling code (`mcpServerGenerator.ts` lines 295-300).
- **Sampling prompt text.** The generated `createMessage` call sends the placeholder text "Your prompt here" (`mcpServerGenerator.ts` line 205).
- **Whether the sampling and elicitation calls match your SDK version.** The generator calls `server.createMessage` and `server.elicitInput` on the `McpServer` object. No test checks these against the `@modelcontextprotocol/sdk` version in the generated `package.json`, which pins `^1.2.0` (`readmeGenerator.ts` line 353).
- **Docker build.** The Dockerfile runs `npm ci` (`dockerGenerator.ts` lines 20 and 42). No export bundle contains a `package-lock.json` (see `exportBundler.ts` lines 37-42), so `npm ci` has no lockfile to install from unless you add one. No test builds the image.
- **Railway and v0 exports.** Railway config is asserted as text only. The v0 export has its own tests in `v0Generator.test.ts`, which this page does not cover.
- **Generated `npm test` script.** `package.json` sets `test` to `node --test`, and the bundle contains no test files.
- **Validation inside the exported server matches the simulator.** The "Runtime Validation" tests in `constraints.test.ts` call `validateParameters` from `lib/simulators/mcpTestSimulator.ts`. They test the in-app simulator, not the Zod code in an export.

## Not guaranteed

These follow from the generated code as written. None is covered by a test.

- **Input escaping is partial.** Parameter descriptions, resource and prompt text, and the server name and version go through `escapeDoubleQuoted` or `escapeTemplateLiteral`. Some user-supplied values reach the output unescaped:
  - a tool or resource description, tool icon, and resource name inside `/** ... */` comments (`mcpServerGenerator.ts` lines 302-305 and 346-350), so a value containing `*/` ends the comment early;
  - a resource `uri` and `mimeType` inside double-quoted strings (lines 353 and 363-364);
  - a parameter `pattern`, where only backslashes are escaped, so a double quote ends the string (lines 114-118);
  - parameter names, used directly as object keys and in destructuring (lines 174 and 287);
  - a sampling `modelHint` (line 190) and an elicitation form field's `name` and `type` (lines 242-246).

  Treat the Studio canvas as trusted input. Do not generate servers from configurations you did not write or review, and read generated code before you run it.
- **The HTTP transport is a starting point.** `/messages` posts to the first active SSE transport, not the one that matches the caller's session. The generated comment says "simplified - in production use session ID" (`mcpServerGenerator.ts` lines 497-499). Concurrent clients can interfere with each other.
- **No authentication or authorization.** The HTTP server enables `cors()` with default options, which allows any origin (line 469), and checks no credentials. Add your own before you expose it.
- **No rate limiting, input size limits or timeouts** beyond what the MCP SDK and Express apply by default.
- **Container hardening is limited to what is listed above.** The non-root user is the only hardening feature tested. The base image tag `node:20-alpine` is not pinned to a digest, and no vulnerability scan covers the output.
- **Dependency versions float within the ranges in `package.json`.** You get whatever version satisfies `^1.2.0` for the SDK at install time.
- **No MCP specification version is declared or checked.** The README lists an explicit compatibility policy as a "next candidate".
- **No support, uptime, compliance or security certification.** Studio generates source text. It makes no commitment about how you operate the result.

## Related

- [Getting started](GETTING_STARTED.md)
- Run `pnpm test:run` to see the current test suite. Do not rely on a test count in any document.
