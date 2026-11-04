# @internal/plugin-catalog-helper-backend

## APIS

| endpoint                                                 | method | type    | description                                            |
| -------------------------------------------------------- | ------ | ------- | ------------------------------------------------------ |
| /apis/count                                              | GET    | inner   | used by api-platform front                             |
| /apis/definitions                                        | GET    | inner   | used by api-platform front                             |
| /apis/definitions/:apiName                               | GET    | inner   | used by api-platform front                             |
| /apis/definitions/:apiName/:apiVersion                   | GET    | inner   | used by api-platform front                             |
| /services                                                | GET    | inner   | used by api-platform front                             |
| /services/:serviceName                                   | GET    | inner   | used by api-platform front                             |
| /systems                                                 | GET    | inner   | used by api-platform front                             |
| /systems/:systemName                                     | GET    | inner   | used by api-platform front                             |
|                                                          |        |         |                                                        |
| /locations                                               | POST   | exposed | register or refresh catalog-info location in Backstage |
| /services/:serviceName/:serviceVersion/:containerVersion | POST   | exposed | register APIs used by service in api-platform          |
| /services/:serviceName/:serviceVersion/:containerVersion | GET    | exposed | get APIs used by service from api-platform             |

```
curl -H "Authorization: Bearer {token}" http://localhost:7007/api/api-platform/{endpoint}
```

## Inner APIs

```
curl -H "Authorization: Bearer my-access-token" http://localhost:7007/api/api-platform/apis
```

## MCP response selection

`get-entity-by-ref` accepts a full `entityRef` in `kind:namespace/name` format
(for example `api:default/example`) and returns `{entityRef, entity}` with the
complete catalog entity, including all available metadata, spec and relations.
Copy references from list/version/dependency results; kind and namespace are
required. Any catalog kind is supported. References are canonicalized
case-insensitively. Invalid references and missing entities produce errors;
catalog failures propagate. This read-only lookup uses the same service
credentials as the other API Platform actions, with no pagination or chunking.

MCP outputs default to compact identity summaries; successful REST and
frontend payloads are unchanged. Invalid inputs, missing resources, and
unavailable dependencies use Backstage error conventions. Every MCP action
advertises its selectors and continuation rules in discovery metadata.

Output schemas describe page envelopes, item identities, summaries, relation
directions, section selectors and detail fields. Catalog entity outputs require
`apiVersion`, `kind` and `metadata.name` while preserving custom catalog fields.
Optional namespace/System identifiers and opt-in detail pages remain optional.

| Tool                            | Default                                                   | Opt-in details                                                                           |
| ------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `get-apis`                      | Page of latest API identities with complete descriptions  | Continue with `apis.nextOffset`; no detail selector or chunking                          |
| `get-api-versions-by-name`      | Array of all matching API/version identities              | No pagination or chunking                                                                |
| `get-api-by-name-and-version`   | One compact API/version identity                          | No large definition is included                                                          |
| `get-api-dependencies`          | Consumer/provider relationship counts                     | `details=true`; optional `direction` and `environment`                                   |
| `get-services`                  | Logical name, System, owner, version/environment counts   | Use `get-service-versions`                                                               |
| `get-service-versions`          | Page of versions and environment names                    | `section=environments` or `dependencies`; optional exact `version` and `environment`     |
| `get-service-dependencies`      | Environment and consumed/provided API relationship counts | `details=true`; optional exact `version`, `environment`, `imageVersion`, and `direction` |
| `get-systems`                   | Page of System identities and owners                      | Use `get-system-by-name`                                                                 |
| `get-system-by-name`            | Identity and related-name counts                          | `section=apis`, `services`, `libraries`, or `entity`                                     |
| `get-members-of-system-by-name` | Page of User identities and display names                 | `details=true` for raw User entities                                                     |

Relation pages contain one relationship per item, rather than unbounded nested
arrays. API relations use `{direction, api, service, lifecycle}`; service
relations use `{direction, service, api}`. Counts represent relationships across
matching environments, not distinct logical APIs/services.

All pages include `items`, `offset`, `limit`, `totalCount`, `hasMore`, and
`nextOffset`. The default limit is 20; the maximum is 100. Continue by copying
`nextOffset` into input `offset`; a final or empty page has `hasMore=false` and
`nextOffset=null`. Keep filters and sorting unchanged while traversing an
unchanged dataset.

All paginated actions use the shared `pageItems` envelope, including list
actions whose services already return a page (these are not sliced twice).
`nextOffset` advances by the number of returned items, including short pages.

Pagination limits response size, not necessarily data loading:

- `get-apis` and `get-services` load and group all matching catalog entities
  before slicing a page in memory.
- Dependency actions load and resolve all matching relationships before
  filtering, sorting and pagination in memory, even for summary responses.
- `get-service-versions`, System related-name sections, and System members
  load all matching data before filtering/sorting and pagination in memory.
- `get-systems` delegates offset/limit pagination to the catalog.

### Direct outputs (API Platform and MCA)

All tools return their selected output directly, without JSON chunking or a
serialized byte cap. No action accepts `contentOffset`. Existing page limits,
summary projections and detail/section selectors still apply.
All three MCA tools return complete metadata or parsed content in one response.
`get-apis` keeps offset/limit pagination but always returns complete projected
fields, including full descriptions, without chunking or a byte cap.
`get-api-versions-by-name` returns all matching versions as an array without
pagination, chunking or a byte cap.

MCA definitions accept `name` and optional `refP`, returning the complete parsed
operation analysis or element fields in `result`. The `definition` identity
includes resolved `refP`. This tool has no pagination or chunking.

MCA component metadata accepts only `name` and returns all metadata fields in
one response.

MCA Javadoc accepts only `name` and returns all parsed sections and members,
including complete descriptions and tags. It does not accept `offset`, `limit`
or `contentOffset`.

Regression fixtures cover hundreds of versions, environments, relationships,
members and definition children, plus long Unicode documentation and single
oversized values. Tests verify direct oversized responses and complete
page traversal without gaps or duplicates.

## Exposed APIs

```
curl -H "Authorization: Bearer my-access-token" http://localhost:7007/api/api-platform/service-informations/service-ecommerce/1/20250120.2
```
