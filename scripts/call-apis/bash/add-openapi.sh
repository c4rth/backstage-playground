curl -v -X POST "http://localhost:7007/api/catalog/entities" \
-H "Authorization: Bearer my-access-token" \
-H "Content-Type: application/json" \
-d '{
  "apiVersion": "backstage.io/v1alpha1",
  "kind": "API",
  "metadata": {
    "name": "your-api-name",
    "namespace": "default"
  },
  "spec": {
    "type": "openapi",
    "lifecycle": "production",
    "owner": "team-a.c",
    "definition": {
        "$text":"https://github.com/c4rth/playground-openapi/blob/main/openapi-ecommerce.yaml"
    }
  }
}'