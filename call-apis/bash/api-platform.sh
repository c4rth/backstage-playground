
curl -v -X GET -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" http://localhost:7007/api/api-platform


# https://github.com/c4rth/playground-openapi/tree/main/api/ecommerce/1.0.0/catalog-info.yaml

curl -v -X DELETE -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" http://localhost:7007/api/api-platform/catalog/API/ecommerce-v1.0.0

http://localhost:7007/api/catalog/entities?fields=kind,metadata.uid,metadata.name,metadata.namespace&filter=metadata.annotations.backstage.io%2Fmanaged-by-origin-location%3Durl%3Ahttps%3A%2F%2Fgithub.com%2Fc4rth%2Fplayground-openapi%2Fblob%2Fmain%2Fapi%2Fecommerce%2F9.9.9%2Fcatalog-info.yaml





curl -v -X POST -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" --data '{"kind":"API", "target":"https://github.com/c4rth/playground-openapi/blob/main/api/ecommerce/0.0.1/catalog-info.yaml"}' http://localhost:7007/api/api-platform/catalog

curl -v -X GET -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" http://localhost:7007/api/api-platform/apis/count

curl -v -X GET -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" http://localhost:7007/api/api-platform/systems