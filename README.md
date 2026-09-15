# [Backstage](https://backstage.io)

## node

version 24.21.0

headers: https://nodejs.org/download/release/v24.21.0/

## bump versions

```sh
yarn backstage-cli versions:bump
```

```sh
curl -o backstage-manifest.json https://versions.backstage.io/v1/releases/1.54.7/manifest.json
```

## install packages

```sh
make install
```

## outdated packages

```sh
yarn upgrade-interactive
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
