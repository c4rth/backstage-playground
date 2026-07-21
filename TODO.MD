# Plugins

# To check

- AutoLogout

# NFS

## plugins

backstage:

- api-docs
- DONE: catalog
- DONE: devtools
- DONE: home
- org
- scaffolder .... busy
- search
- DONE: techdocs
- DONE: user-settings

community:

- DONE: entity-validation
- LEGACY: shortcuts
- sonarqube

## TODO

- protect routes
  - moved to plugin loader()

- UI

  - update to bui Table
    - DONE: analytics
    - api-platform
    - DONE: app-registry
    - DONE: azure-devops
    - DONE: catalog-admin
    - DONE: health-dashboard
    - mca
    - DONE: toolkit

  - cleanup plugins:
    use only NFS -> remove old plugins and duplicated JSX components
    - analytics
    - api-platform
    - app-registry
    - azure-devops
    - health-dashboard
    - mca
    - toolkit

## DONE

- nfs:
  custom:
  - DONE: analytics
  - DONE: api-platform
  - DONE: app-registry
  - DONE: azure-devops
  - DONE: health-dashboard
  - DONE: mca
  - DELETED: techdocs
  - DONE: toolkit

- scaffolder
  - update extensions
  - add to scaffolder

- admin - catalog:
  - remove catalog import menu
  - admin: 1 entry catalog -> 3 tabs: delete, validation, import

- UI
  - cleanup themes: standard

  - add info popup
    - done:
      - health
      - mca: basetypes, components
      - api-platform

  - cleanup plugins:
    use only NFS -> remove old plugins and duplicated JSX components
    - DONE: analytics
    - DONE: api-platform
    - DONE: app-registry
    - DONE: azure-devops
    - DONE: health-dashboard
    - DONE: mca
    - DONE: toolkit

  - update to bui (header, card, etc)
    - DONE: analytics
    - DONE: api-platform
    - DONE: app-registry
    - DONE: azure-devops
    - DONE: health-dashboard
    - DONE: mca
    - DONE: toolkit

  - toolkit
    - use bui components TextAreaField
