## secrets

### postgres-secrets

- POSTGRES_USER
- POSTGRES_PASSWORD

### backstage-secrets

- AZURE_TENANT_ID
- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- AZURE_STORAGE_ACCOUNT_NAME
- AZURE_STORAGE_CONTAINER_NAME
- ADO_PERSONAL_ACCESS_TOKEN

## deploy
```
kubectl apply 01-secrets.yaml
kubectl apply 02-deploy-psql.yaml
kubectl apply 03-deploy-backstage.yaml
```

## services
```
sudo kubectl port-forward svc/backstage -n backstage 80:80
```

