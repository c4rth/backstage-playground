# [Backstage](https://backstage.io)

## node

version 24.21.0

headers: https://nodejs.org/download/release/v24.22.2/

## bump versions

```sh
yarn backstage-cli versions:bump
```

```sh
curl -o backstage-manifest.json https://versions.backstage.io/v1/releases/1.56.4/manifest.json
```

## install packages

```sh
make install
```

## outdated packages

```sh
yarn upgrade-interactive
```

## codemod

```sh
yarn dlx codemod run @backstage/v1-52-0-migration-recipe --target . --dry-run
```

## compile

```sh
make tsc
```

## run dev

start db

```sh
podman compose -f docker-db-compose.yml up -d
```

start backstage

```sh
make run
```

### .env

```
AZURE_CLIENT_ID="..."
AZURE_CLIENT_SECRET="..."
AZURE_TENANT_ID="..."
```

## MCP analytics

The analytics dashboard reports completed MCP tool calls by tool name, with
separate succeeded and failed counts, including calls to Backstage-provided
tools. The selected dashboard
date range also applies to these counts. Events contain no caller identity,
arguments, or results and do not count as dashboard visitors. They follow the
existing `analytics.threshold` retention policy.

The backend records these events through the `mcp-actions` audit service.
Recording failures are logged and do not fail the tool call.
