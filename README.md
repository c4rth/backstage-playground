# [Backstage](https://backstage.io)

## node

version 24.12.0

headers: https://nodejs.org/download/release/v24.12.0/

## bump versions

```sh
yarn backstage-cli versions:bump
```

```sh
curl -o backstage-manifest.json https://versions.backstage.io/v1/releases/1.54.0/manifest.json
```

## install packages

```sh
yarn install
```

## outdated packages

```sh
yarn upgrade-interactive
```

## compile

```sh
yarn tsc
```

## run dev

start db

```sh
podman compose -f docker-db-compose.yml up -d
```

start backstage

```sh
./run.sh
```

### .env

```
AZURE_CLIENT_ID="..."
AZURE_CLIENT_SECRET="..."
AZURE_TENANT_ID="..."
```

### app-config.local.yaml

```
backend:
  auth:
    externalAccess:
      - type: legacy
        options:
          secret: ...
          subject: legacy-catalog
      - type: legacy
        options:
          secret: ...
          subject: legacy-scaffolder
permission:
  enabled: true
  rbac:
    admin:
      users:
       - name: 'group:default/backstage-admin'
       - name: 'user:default/...'
      superUsers:
       - name: 'user:default/...'
```
