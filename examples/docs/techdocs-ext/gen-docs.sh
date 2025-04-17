techdocs-cli generate --no-docker

export $(cat ../../../.env | xargs)

#techdocs-cli publish --publisher-type azureBlobStorage --storage-name $AZURE_STORAGE_CONTAINER_NAME --entity default/component/ext-generated-component --azureAccountName $AZURE_STORAGE_ACCOUNT_NAME
techdocs-cli publish --publisher-type azureBlobStorage --storage-name $AZURE_STORAGE_CONTAINER_NAME --entity team-a/component/ext-generated-component --azureAccountName $AZURE_STORAGE_ACCOUNT_NAME