# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
```
```sh
yarn dev
```
## Local dev
Start with .env and debug logging
```sh
docker compose up
yarn env-dev
```
### .env
```
AZURE_AUTH_CLIENT_ID="..."
AZURE_AUTH_CLIENT_SECRET="..."
AZURE_AUTH_TENANT_ID="..."

AZURE_GRAPH_CLIENT_ID="..."
AZURE_GRAPH_CLIENT_SECRET="..."
AZURE_GRAPH_TENANT_ID="..."
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

# Changelog
## Signals
https://github.com/backstage/backstage/issues/23927


# Send notifications
# https://github.com/backstage/backstage/blob/master/beps/0001-notifications-system/README.md

```
curl -i -X POST 'http://localhost:7007/api/notifications' -H 'Authorization: Bearer mock-service-token' -H 'content-type: application/json' -d '{"recipients": {"entityRef": "user:development/guest", "type": "entity"}, "payload": {"title": "Hello", "link": "http://example.com"}}'
```

```
curl -i -X POST 'http://localhost:7007/api/notifications' -H 'Authorization: Bearer mock-service-token' -H 'content-type: application/json' -d '{"recipients": {"type": "broadcast"}, "payload": {"title": "Hello title", "description": "Notification description", "severity": "critical", "link": "http://example.com"}}'
```

curl -i -X POST 'http://localhost:7007/api/notifications' -H 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjViY2Y5OTA1LTVkMzktNGYzZC05NmVhLTZhMjAzZDg0OTFlNiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjcwMDcvYXBpL2F1dGgiLCJzdWIiOiJ1c2VyOmRlZmF1bHQvdGhpZXJyeS5jYXJlbHNfZ21haWwuY29tIiwiZW50IjpbInVzZXI6ZGVmYXVsdC90aGllcnJ5LmNhcmVsc19nbWFpbC5jb20iLCJncm91cDpkZWZhdWx0L2JhY2tzdGFnZS1hZG1pbiIsImdyb3VwOmRlZmF1bHQvYmFja3N0YWdlLXVzZXJzIiwiZ3JvdXA6ZGVmYXVsdC9tc2FsLXJlYWN0LWRlbW8uYWRtaW4iLCJncm91cDpkZWZhdWx0L21zYWwtcmVhY3QtZGVtby51c2VyIl0sImF1ZCI6ImJhY2tzdGFnZSIsImlhdCI6MTcxMjEyNzgyNSwiZXhwIjoxNzEyMTMxNDI1fQ.gnPNfSexj31LJlz6PdMIxDe3LQSV16AZUs1vG4KXndcQOMxREZS96ETNMVeXdcPrfaVWnSVPS-JZVtjDFUiOcw' -H 'content-type: application/json' -d '{"recipients": {"type": "broadcast"}, "payload": {"title": "Hello title", "description": "Notification description", "severity": "critical", "link": "http://example.com"}}'