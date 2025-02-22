# @internal/plugin-api-platform-backend

## APIS


| endpoint                                                 | method | type    | description                                            |
|----------------------------------------------------------|--------|---------|--------------------------------------------------------|
| /apis                                                    | GET    | inner   | used by api-platform front                             |
| /apis/:apiName                                           | GET    | inner   | used by api-platform front                             |
| /apis/:apiName/:apiVersion                               | GET    | inner   | used by api-platform front                             |
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

## Exposed APIs

```
curl -H "Authorization: Bearer my-access-token" http://localhost:7007/api/api-platform/services/service-ecommerce/1/20250120.2
```