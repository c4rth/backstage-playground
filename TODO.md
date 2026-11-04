# MCP actions TODO

Review scope: `api-platform-backend` and `mca-backend` MCP actions.

## Performance

- [x] Remove serial N+1 catalog lookups in `ApiServiceImpl.getApiRelations`: collect related service refs and batch-fetch them, following the existing batch-fetch pattern in `ServiceServiceImpl.getServiceRelations`.
- [x] Fetch consumer and provider API relations concurrently in `get-api-dependencies`.
- [ ] Avoid fetching and aggregating every matching catalog entity before returning a page in `listApis` and `listServices`. Use catalog-side pagination where it preserves latest-version/grouping semantics, or introduce a cached/indexed summary for aggregation-heavy listings.
- [ ] Add a lightweight summary/count path for dependency actions so calls with `details=false` do not construct and resolve full relation details.
- [ ] Bound potentially large results. Add pagination or selectable sections/fields for API versions, MCA component definitions, and Javadoc; retain an explicit full-detail option where needed.

## Usability for agents

- [x] Replace `z.custom<OpenApiType>()` in `get-apis` with a schema that enumerates supported API types.
- [ ] Tighten input schemas: trim and reject empty/whitespace-only names and searches where appropriate; document defaults and constraints.
- [ ] Make lookup behavior predictable. Prefer exact API version matching, or return an explicit ambiguity/no-match result instead of selecting the first prefix match; return a clear not-found error for missing MCA component metadata rather than `{ component: undefined }`.
- [x] Replace passthrough-only output schemas with useful typed shapes for page envelopes, summaries, relation items, and common results.
- [ ] Offer concise defaults or selectable detail levels for large entities and documents to reduce unnecessary agent context usage.

## Clean coding and reliability

- [x] Standardize input, not-found, and service errors across both plugins using the repository's Backstage error conventions.
- [x] Consider a small shared helper for genuinely common action-registration conventions (schemas, attributes, and logging), without abstracting plugin-specific behavior.
- [x] Align pagination response contracts across actions using `pageItems`, and make clear when pagination occurs only after loading all matching data.
- [ ] Remove stale placeholder comments in the System actions and resolve repeated output-schema TODOs as part of the schema work.
