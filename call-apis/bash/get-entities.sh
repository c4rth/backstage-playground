curl -X GET "http://localhost:7007/api/catalog/entities/by-query?filter=kind=API&fields=metadata.name" \
-H "Authorization: Bearer my-access-token" \
-H "Content-Type: application/json"