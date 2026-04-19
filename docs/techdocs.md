# TechDocs

## General remarks

### MkDocs

Only techdocs-cli generation is supported by Backstage.

- use mkdocs
- generate metadata

Plugin techdocs "hacks" the css and layout.

## Overview

Switch to [Basic](https://backstage.io/docs/features/techdocs/architecture#basic-out-of-the-box) to [Recommended deployment](https://backstage.io/docs/features/techdocs/architecture#recommended-deployment)

By default Backstage generates the HTML pages with MkDocs and push them to a blob storage account.

To take care of stability, scalability and speed, it is recommended to externalize the generation and publish process.

## Recommended Deployment

- [Disable the generation in Backstage](#disable-generation)
- [CI-CD pipeline to generate and publish the HTML pages](#ci-cd-pipeline)

![Recommended](https://backstage.io/assets/images/architecture-recommended.drawio-b90a644e7ae6f63987a9e5c50efdcb40.svg)

### Remarks

#### Storage access

How to give access to devops teams?

### Disable generation

```yaml
techdocs:
  builder: 'external'
  publisher:
    type: 'azureBlobStorage'
    azureBlobStorage:
      containerName: ${AZURE_STORAGE_CONTAINER_NAME}
      credentials:
        accountName: ${AZURE_STORAGE_ACCOUNT_NAME}
```

### CI-CD pipeline

#### Container

Create a specific container based on python:3.12-alpine

Add:

- gcc, musl-dev, openjdk17-jdk, curl, graphviz, ttf-dejavu, fontconfig
- plantuml.jar
- mkdocs-techdocs-core + plugins

!! nodejs, techdocs-cli

### Pipeline

- checkout doc repo
- generate site
- publish site
- create and register techdocs catalog-info

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  namespace: <defl>
  name: <defl>-docs-<repo name>
  title: <from mkdocs.yml>
  description: <from mkdocs.yml>
  annotations:
    backstage.io/techdocs-ref: dir:.
spec:
  type: documentation
  lifecycle: PRD
  owner: group:default/<defl>
```

### Problems

#### Pipeline

Access to storage account

#### Sphinx-RST

Check https://mkdocstrings.github.io/
