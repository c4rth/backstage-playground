#curl -v -X POST -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" http://localhost:7007/api/api-platform/location

#curl -v -X POST -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" --data '{"qsdfqsdfqs":"xyz"}' http://localhost:7007/api/api-platform/location

#curl -v -X POST -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" --data '{"target":"https://github.com/c4rth/playground-openapi/tree/main/api/api-product-v1.0.2.yaml"}' http://localhost:7007/api/api-platform/location

#curl -v -X POST -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" --data '{"target":"https://github.com/c4rth/playground-openapi/tree/main/api/api-product-v1.0.0.yaml"}' http://localhost:7007/api/api-platform/location

#curl -v -X POST -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" --data '{"target":"https://github.com/c4rth/playground-openapi/tree/main/api/api-product-v1.0.10.yaml"}' http://localhost:7007/api/api-platform/location

curl -v X GET -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" http://localhost:7007/api/api-platform


# https://github.com/c4rth/playground-openapi/tree/main/api/ecommerce/1.0.0/catalog-info.yaml

curl -v X DELETE -H "Authorization: Bearer my-access-token" -H "Content-Type: application/json" http://localhost:7007/api/api-platform/catalog/API/ecommerce-v1.0.0

